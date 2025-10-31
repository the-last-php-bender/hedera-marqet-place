import { Injectable } from '@nestjs/common';
import { Client, TopicId, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PublishReviewPayload } from '../interface/hedera.interface';

@Injectable()
export class HederaService {
  private client: Client;
  private topicId: TopicId;

  constructor(private configService: ConfigService) {
    const operatorId = this.configService.get<string>('hedera.operatorId') ?? '';
    const operatorKey = this.configService.get<string>('hedera.operatorKey') ?? '';
    const topic = this.configService.get<string>('hedera.topicId') ?? '';
    this.client = Client.forTestnet().setOperator(operatorId, operatorKey);
    this.topicId = TopicId.fromString(topic);
  }

async publish(
  data: PublishReviewPayload
): Promise<{ hash: string; txId: string; status: string }> {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');

  const tx = await new TopicMessageSubmitTransaction({
    topicId: this.topicId,
    message: hash,
  }).execute(this.client);

  const receipt = await tx.getReceipt(this.client);

  return {
    hash,
    txId: tx.transactionId.toString(),  
    status: receipt.status.toString(), 
  };
}

}
