import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Sample } from "../target/types/sample";
import { expect } from "chai";
import { PublicKey, Connection } from "@solana/web3.js";

describe("sample", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.sample as Program<Sample>;

  it("Is transferred!", async () => {
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

  it("is_vault_initialized", async()=>{
    const user = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);
    const tx = await program.methods.initializeVault()
    .accounts({
      user:user.publicKey
    })
    .signers([user])
    .rpc()
    const txDetails = await provider.connection.getTransaction(tx, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    const logs = txDetails?.meta?.logMessages || null
    console.log("logs", logs)
    if(logs){
      console.log("Logs", logs)
    }
  })

  it("is_transferring_to_vault", async()=>{
    const user = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);
    const tx = await program.methods.initializeVault()
    .accounts({
      user:user.publicKey
    })
    .signers([user])
    .rpc()
    let transfer_amount = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL/2)

    const tx2 = await program.methods.transferToVault(transfer_amount)
    .accounts({
      user: user.publicKey
    })
    .signers([user])
    .rpc()
    console.log("Transaction: ",tx2)
    const seeds = [Buffer.from("vault"), user.publicKey.toBuffer()];
    const [pdaPublicKey, bumpSeed] = PublicKey.findProgramAddressSync(seeds, program.programId) 
    const decodedAccount = await program.account["vaultStruct"].fetch(pdaPublicKey);
    console.log("Decoded acc",decodedAccount.authority.toBase58())
    expect(decodedAccount.authority.toBase58()).to.be.equal(user.publicKey.toBase58())
  })

  it("is_transferring_to_user_from_vault", async()=>{
    const user = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);
    const tx = await program.methods.initializeVault()
    .accounts({
      user:user.publicKey
    })
    .signers([user])
    .rpc()
    const transfer_amount = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL/2)

    const tx2 = await program.methods.transferToVault(transfer_amount)
    .accounts({
      user: user.publicKey
    })
    .signers([user])
    .rpc()
    console.log("Transaction: ",tx2)
    const transfer_back_amount = new anchor.BN(transfer_amount.toNumber() - 0.1 * anchor.web3.LAMPORTS_PER_SOL )
    const tx3 = await program.methods.transferToUserFromVault(transfer_back_amount)
    .accounts({
      user: user.publicKey
    })
    .rpc()
    console.log("Transaction 3: ", tx3)
  })

  it("is_closing_account", async()=>{
    const user = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);
    const tx = await program.methods.initializeVault()
    .accounts({
      user:user.publicKey
    })
    .signers([user])
    .rpc()
    let transfer_amount = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL/2)

    const tx2 = await program.methods.transferToVault(transfer_amount)
    .accounts({
      user: user.publicKey
    })
    .signers([user])
    .rpc()
    const tx5 = await program.methods.closeVault()
    .accounts({
      user: user.publicKey
    })
    .signers([user])
    .rpc()
    
    console.log("Transaction: ",tx5)
    const userBalance = await provider.connection.getBalance(user.publicKey);
    expect(userBalance).to.be.equal(anchor.web3.LAMPORTS_PER_SOL)
  })
  
});
