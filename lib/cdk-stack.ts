import * as cdk from '@aws-cdk/core';
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from '@aws-cdk/aws-lambda'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import { Architecture } from "@aws-cdk/aws-lambda";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = new s3.Bucket(this, "edge-test-bucket")

    const oai = new cloudfront.OriginAccessIdentity(this, 'edge-test-oai')

    const bucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject"],
      principals: [
        new iam.CanonicalUserPrincipal(
          oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
        )
      ],
      resources: [s3Bucket.bucketArn + "/*"]
    })

    s3Bucket.addToResourcePolicy(bucketPolicy)

    const edgeFnc = new cloudfront.experimental.EdgeFunction(this, "lambda-edge", {
      code: lambda.Code.fromAsset("dest"),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(5),
      memorySize: 256 // 256MB

    })

    const cf = new cloudfront.CloudFrontWebDistribution(this, "LambdaEdgeTestDistribution", {
      viewerCertificate: {
        aliases: [],
        props: {
          cloudFrontDefaultCertificate: true
        }
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: s3Bucket,
            originAccessIdentity: oai
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.minutes(30),
              defaultTtl: cdk.Duration.minutes(10),
              pathPattern: "/*",
              lambdaFunctionAssociations: [
                {
                  eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                  lambdaFunction: edgeFnc
                }
              ]
            }
          ]
        }
      ],
      errorConfigurations: [
        {
          errorCode: 403,
          responsePagePath: '/index.html',
          responseCode: 200,
          errorCachingMinTtl: 0
        },
        {
          errorCode: 404,
          responsePagePath: '/index.html',
          responseCode: 200,
          errorCachingMinTtl: 0
        }
      ]
    })
  }
}
