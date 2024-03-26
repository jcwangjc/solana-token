//引入模块
import {percentAmount,generateSigner,signerIdentity,createSignerFromKeypair} from '@metaplex-foundation/umi'
import {TokenStandard,createAndMint,mplTokenMetadata} from '@metaplex-foundation/mpl-token-metadata'
import {createUmi} from '@metaplex-foundation/umi-bundle-defaults'
import {Keypair} from '@solana/web3.js'
import {readFileSync} from 'fs'

//链接到solana dev网络
const umi=createUmi('https://api.devnet.solana.com')
//通过本地私钥初始化钱包
const userKeypair=Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync('/Users/yangzhibang/.config/solana/id.json','utf-8')))
)
console.log(userKeypair.secretKey)
//获取签名用户
const userWallet=umi.eddsa.createKeypairFromSecretKey(userKeypair.secretKey)
const userWalletSigner=createSignerFromKeypair(umi,userWallet)
//构建元数据
const metadata={
    "name":"Lao A Coin",
    "symbol":"LaoA",
    "uri":"https://aqua-kind-donkey-807.mypinata.cloud/ipfs/Qmaw5Nwvf3MNcgJLLafVuGM6YJEd9pLynY5jiWujc18xGW"
}
//生成mint签名用户
const mint=generateSigner(umi)
umi.use(signerIdentity(userWalletSigner)).use(mplTokenMetadata())
//打包发送
createAndMint(umi,{
    mint,
    authority:umi.identity,
    name:metadata.name,
    symbol:metadata.symbol,
    uri:metadata.uri,
    sellerFeeBasisPoints: percentAmount(0),//卖方的费用，设置为0说明没有费用
    decimals:6,
    amount:666_000000,//生成代币的数量
    tokenOwner:userWallet.publicKey, 
    tokenStandard:TokenStandard.Fungible //令牌标准，这里表示可替代令牌
}).sendAndConfirm(umi).then(()=>{
    console.log("Successfully minted tokens (",mint.publicKey,")")
})