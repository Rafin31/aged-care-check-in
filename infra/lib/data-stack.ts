import * as cdk from 'aws-cdk-lib/core';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DataStack extends cdk.Stack {
  public readonly checkInTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Single-table design: PK=personId, SK=checkinTimestamp.
    // Portfolio project — DESTROY so `cdk destroy` fully tears down, no
    // orphaned table left racking up storage after teardown.
    this.checkInTable = new dynamodb.Table(this, 'CheckInTable', {
      tableName: 'AgedCareCheckIns',
      partitionKey: { name: 'personId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'checkinTimestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GSI for carer lookup: "show all check-ins for people this carer manages"
    this.checkInTable.addGlobalSecondaryIndex({
      indexName: 'carerId-index',
      partitionKey: { name: 'carerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'checkinTimestamp', type: dynamodb.AttributeType.STRING },
    });
  }
}
