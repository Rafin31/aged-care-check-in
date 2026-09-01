#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';

const app = new cdk.App();

new DataStack(app, 'DataStack', {});
new AuthStack(app, 'AuthStack', {});
