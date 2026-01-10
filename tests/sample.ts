import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Sample } from "../target/types/sample";
import { expect } from "chai";


describe("sample", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.sample as Program<Sample>;

  it("Is initialized!", async () => {
    // Add your test here.
    const from = anchor.web3.Keypair.generate();
    const to = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(from.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);
    const amount = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL * 0.5);
    const tx = await program.methods.transfer(amount)
    .accounts({
      from: from.publicKey,
      to: to.publicKey
    })
    .signers([from])
    .rpc()
    console.log("Your transaction signature", tx);
    expect(tx).to.not.be.null;
    const fromBalance = await provider.connection.getBalance(from.publicKey);
    expect(fromBalance).to.be.equal(amount.toNumber());
    const toBalance = await provider.connection.getBalance(to.publicKey);
    expect(toBalance).to.be.equal(amount.toNumber());
  });
});
