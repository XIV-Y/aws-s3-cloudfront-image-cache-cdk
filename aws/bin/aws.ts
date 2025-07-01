#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { S3CloudfrontImageStack } from '../lib/s3-cloudfront-image-stack';

const app = new cdk.App();

new S3CloudfrontImageStack(app, 'S3CloudfrontImageStack', {});
