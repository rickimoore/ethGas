import {Injectable, OnApplicationBootstrap, Inject} from '@nestjs/common';
import {SchedulerRegistry} from "@nestjs/schedule/dist";
import { JsonRpcProvider, Block, formatUnits, TransactionResponse } from "ethers";
import {CACHE_MANAGER} from "@nestjs/cache-manager/dist";
import { Cache } from 'cache-manager';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ){}

  async onApplicationBootstrap(): Promise<void> {
    console.log('Application Bootstrapping....')
    const provider = new JsonRpcProvider(process.env.RPC_URL);

    this.setDynamicInterval('calculate-fees', 6000, async () => {
      await this.calculateFees(provider)
    })
  }

  async getFees (provider: any, blockNumber: number) {
    const data = await provider.getBlock(blockNumber) as Block;
    const baseFeePerGas = data.baseFeePerGas || BigInt(0);

    let txData = [];
    let gasPrices = [];

    data.transactions.forEach((tx) => {
      txData.push(provider.getTransaction(tx));
    });

    txData = await Promise.all(txData);

    txData.forEach((tx: TransactionResponse) => {
      const { type, maxPriorityFeePerGas, gasPrice } = tx;

      if(type === 2) {
        gasPrices.push(maxPriorityFeePerGas)
      } else {
        gasPrices.push(gasPrice - baseFeePerGas)
      }
    })

    return {gasPrices, baseFeePerGas: baseFeePerGas * data.gasUsed}
  }
  formatFeeAverages (fees, baseFee) {
    const feesInGwei = fees.map((fee) => parseFloat(formatUnits(fee, 'gwei')));
    feesInGwei.sort((a, b) => a - b);

    const baseFeeGwei = parseFloat(formatUnits(baseFee, 'gwei'))

    const low = feesInGwei[Math.floor(feesInGwei.length * 0.1)];   // 10th percentile
    const average = feesInGwei[Math.floor(feesInGwei.length * 0.5)]; // Median
    const high = feesInGwei[Math.floor(feesInGwei.length * 0.9)];   // 90th percentile

    return {
      low: {
        priorityFee: low,
        maxFee: baseFeeGwei + low
      },
      average: {
        priorityFee: average,
        maxFee: baseFeeGwei + average
      },
      high: {
        priorityFee: high,
        maxFee: baseFeeGwei + high
      }
    }
  }
  async calculateFees (provider: any) {
    const {number, baseFeePerGas} = await provider.getBlock('latest');

    let fees = [];
    let baseFees = [];

    for (let i = 0; i < 10; i++) {
      const {gasPrices, baseFeePerGas} = await this.getFees(provider, number - i);
      fees = [...fees, ...gasPrices];
      baseFees.push(baseFeePerGas)
    }

    const feeAverages = this.formatFeeAverages(fees, baseFeePerGas)

    await this.cacheManager.set('fee-recommendations', feeAverages, 0)
  };

  private setDynamicInterval(name: string, milliseconds: number, callback: () => void) {
    const interval = setInterval(callback, milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
    console.log(`Interval ${name} set to run every ${milliseconds / 1000} seconds`);
  }
}
