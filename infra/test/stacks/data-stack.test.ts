import * as cdk from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { DataStack } from '../../lib/data-stack';

test('DynamoDB check-in table created with single-table key schema', () => {
  const app = new cdk.App();
  const stack = new DataStack(app, 'TestDataStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::DynamoDB::Table', {
    TableName: 'AgedCareCheckIns',
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [
      { AttributeName: 'personId', KeyType: 'HASH' },
      { AttributeName: 'checkinTimestamp', KeyType: 'RANGE' },
    ],
  });

  template.hasResourceProperties('AWS::DynamoDB::Table', {
    GlobalSecondaryIndexes: [
      {
        IndexName: 'carerId-index',
        KeySchema: [
          { AttributeName: 'carerId', KeyType: 'HASH' },
          { AttributeName: 'checkinTimestamp', KeyType: 'RANGE' },
        ],
      },
    ],
  });
});
