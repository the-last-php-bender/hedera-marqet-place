import { Injectable } from '@nestjs/common';
import { Client, TopicId, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HederaService {

  constructor( private configService: ConfigService){

  }
    private client = Client.forTestnet().setOperator(
    this.configService.get<string>('hedera.operatorId')??'',
    this.configService.get<string>('hedera.operatorKey')??''
  );

  private topicId = TopicId.fromString(this.configService.get<string>('hedera.topicId')??'');

  async publish(data: any) {
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    const tx = await new TopicMessageSubmitTransaction({
      topicId: this.topicId,
      message: hash
    }).execute(this.client);
    const receipt = await tx.getReceipt(this.client);
    return { hash, txId: receipt.status.toString() };
  }
}
