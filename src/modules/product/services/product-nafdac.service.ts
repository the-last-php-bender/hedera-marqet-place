// services/product-nafdac.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import * as qs from 'qs';
import { load } from 'cheerio';

export type NafdacDetails = Record<string, string>;

export interface NafdacVerificationResult {
  success: boolean;
  message: string;
  data?: NafdacDetails;
  raw?: string;
}

const HOME_URL = 'https://registration.nafdac.gov.ng/Home';
const VERIFY_URL = 'https://registration.nafdac.gov.ng/Home/VerifyProduct';

@Injectable()
export class ProductNafdacService {
  private readonly logger = new Logger(ProductNafdacService.name);
  private readonly client: AxiosInstance;
  private readonly defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  constructor() {
    const jar = new CookieJar();
    // wrapper returns an axios instance which supports cookie jar
    this.client = wrapper(axios.create({ jar, withCredentials: true })) as AxiosInstance;
  }

  private async fetchCsrfToken(): Promise<string> {
    const resp = await this.client.get(HOME_URL, { headers: this.defaultHeaders, timeout: 15000 });
    const html = resp.data as string;

    // Try quick regex first
    const tokenMatch = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
    if (tokenMatch) return tokenMatch[1];

    // Fallback to cheerio query
    const $ = load(html);
    const token = $('input[name="__RequestVerificationToken"]').attr('value');
    if (!token) {
      this.logger.error('CSRF token not found on NAFDAC homepage');
      throw new Error('CSRF token not found');
    }
    return token;
  }

  /**
   * Verify a NAFDAC/Certificate number.
   * Returns an object { success, message, data? } where data is a key/value map of the modal table.
   */
  async verify(nafdacNo: string): Promise<NafdacVerificationResult> {
    try {
      const token = await this.fetchCsrfToken();

      const form = {
        CertificateNumber: nafdacNo,
        __RequestVerificationToken: token,
      };

      const headers = {
        ...this.defaultHeaders,
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: HOME_URL,
      };

      const postResp = await this.client.post(VERIFY_URL, qs.stringify(form), { headers, timeout: 20000 });
      const $ = load(String(postResp.data));

      const successMsg = $('.modal-content .alert-success').text().trim();
      const errorMsg = $('.modal-content .alert-danger').text().trim();

      if (successMsg) {
        const details: NafdacDetails = {};
        $('.modal-content table tr').each((_, tr) => {
          const text = $(tr).text().trim();
          const parts = text.split(':');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join(':').trim();
            details[key] = val;
          }
        });

        return { success: true, message: successMsg, data: details };
      }

      if (errorMsg) {
        return { success: false, message: errorMsg };
      }

      // Modal exists but no specific message
      if ($('.modal-content').length) {
        return { success: false, message: 'Verification modal returned but no message found', raw: $.html('.modal-content') ?? undefined };
      }

      // No modal at all → treat as not found
      return { success: false, message: `NAFDAC No '${nafdacNo}' not found or verification failed.` };
    } catch (err: any) {
      this.logger.warn(`Verification failed for ${nafdacNo}: ${err?.message ?? err}`);
      return { success: false, message: `Verification request failed: ${err?.message ?? 'unknown error'}` };
    }
  }
}
