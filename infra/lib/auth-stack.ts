import * as cdk from 'aws-cdk-lib/core';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Carer/family dashboard login. No public self-signup — first test
    // user is created by hand in the Console (Phase 5 checkpoint).
    // Portfolio project — DESTROY so `cdk destroy` fully tears down.
    this.userPool = new cognito.UserPool(this, 'CheckInUserPool', {
      userPoolName: 'AgedCareCheckInUsers',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Browser dashboard app client — no client secret (a public client
    // can't keep a secret safe), SRP auth for the standard Amplify/Cognito
    // login flow.
    this.userPoolClient = new cognito.UserPoolClient(this, 'CheckInDashboardClient', {
      userPool: this.userPool,
      userPoolClientName: 'AgedCareCheckInDashboard',
      generateSecret: false,
      authFlows: { userSrp: true },
    });
  }
}
