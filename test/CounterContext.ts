import { loadFixture, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { callWithSyncFeeLocal } from "../mock/relay";
import { NativeToken } from "../mock/constants";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("CounterContext (sync fee with fee collector, fee token, fee)", async () => {
  const deploy = async () => {
    const [deployer] = await ethers.getSigners();

    const CounterContext = await ethers.getContractFactory("CounterContext");
    const counter = await CounterContext.deploy();

    return { counter, deployer };
  }

  it("Should increment count (ETH)", async () => {
    const { counter, deployer } = await loadFixture(deploy);
    expect(await counter.count()).to.equal(0);

    await setBalance(counter.address, ethers.utils.parseEther('1'));

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data!,
      feeToken: NativeToken,
      chainId: await deployer.getChainId(),
      isRelayContext: true
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.count()).to.equal(1);
  });

  it("Should increment count (ERC20)", async () => {
    const { counter, deployer } = await loadFixture(deploy);
    expect(await counter.count()).to.equal(0);

    const FeeToken = await ethers.getContractFactory("FeeToken");
    const feeToken = await FeeToken.deploy();

    const balance = await feeToken.balanceOf(deployer.address);
    await feeToken.transfer(counter.address, balance);

    const { data } = await counter.populateTransaction.inc();

    const request: CallWithSyncFeeRequest = {
      target: counter.address,
      data: data!,
      feeToken: feeToken.address,
      chainId: await deployer.getChainId(),
      isRelayContext: true
    };

    await callWithSyncFeeLocal(request);

    expect(await counter.count()).to.equal(1);
  });
});
