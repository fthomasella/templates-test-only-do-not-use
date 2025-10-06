#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GoLambdaStack } from './lambda-stack';

const app = new cdk.App();
new GoLambdaStack(app, 'GoLambdaStack');
