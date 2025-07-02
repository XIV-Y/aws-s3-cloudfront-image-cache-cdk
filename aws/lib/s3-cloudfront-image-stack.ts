
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';

export class S3CloudfrontImageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // キャッシュありS3バケット
    const cachedBucket = new s3.Bucket(this, 'CachedImageBucket', {
      bucketName: `cached-images-${this.account}-${this.region}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // キャッシュなしS3バケット
    const noCacheBucket = new s3.Bucket(this, 'NoCacheImageBucket', {
      bucketName: `no-cache-images-${this.account}-${this.region}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');

    cachedBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [cachedBucket.arnForObjects('*')],
      principals: [oai.grantPrincipal],
    }));

    noCacheBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [noCacheBucket.arnForObjects('*')],
      principals: [oai.grantPrincipal],
    }));

    // CloudFrontディストリビューションの設定（3分間のキャッシュを設定）
    const customCachePolicy = new cloudfront.CachePolicy(this, 'CustomCachePolicy', {
      cachePolicyName: 'ThreeMinuteCache',
      defaultTtl: cdk.Duration.seconds(180),
      minTtl: cdk.Duration.seconds(180),
      maxTtl: cdk.Duration.seconds(180),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    const distribution = new cloudfront.Distribution(this, 'ImageDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(cachedBucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: customCachePolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      },
      additionalBehaviors: {
        '/no-cache/*': {
          origin: new origins.S3Origin(noCacheBucket, {
            originAccessIdentity: oai,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
        },
      },
    });

    // ------------------------------------------------

    new cdk.CfnOutput(this, 'CachedBucketName', {
      value: cachedBucket.bucketName,
      description: 'Name of the cached images S3 bucket',
    });

    new cdk.CfnOutput(this, 'NoCacheBucketName', {
      value: noCacheBucket.bucketName,
      description: 'Name of the no-cache images S3 bucket',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
    });
  }
}
