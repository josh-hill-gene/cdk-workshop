import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import cdk = require('@aws-cdk/core');
import * as lambda from '@aws-cdk/aws-lambda';

import { HitCounter } from "../lib/hitcounter";

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromAsset('test')
        })
    });

    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table", {
        SSESpecification: {
            SSEEnabled: true
        }
    }));
});

test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new lambda.Function(stack, 'TestFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'lambda.handler',
            code: lambda.Code.fromAsset('test')
        })
    });
    expectCDK(stack).to(haveResource("AWS::Lambda::Function", {
        Environment: {
            Variables: {
                DOWNSTREAM_FUNCTION_NAME: {
                    Ref: "TestFunction22AD90FC"
                },
                HITS_TABLE_NAME: {
                    Ref: "MyTestConstructHits24A357F0"
                }
            }
        }
    }));
});

test('Read Capacity Can Be Configured', () => {
    const stack = new cdk.Stack();

    expect(() => {
        new HitCounter(stack, 'MyTestConstruct', {
            downstream: new lambda.Function(stack, 'TestFunction', {
                runtime: lambda.Runtime.NODEJS_14_X,
                handler: 'lambda.handler',
                code: lambda.Code.fromAsset('test')
            }),
            readCapacity: 4
        });
    }).toThrowError(/readCapacity must be greater than 5/);
});