# 交易所token发现说明

记录solana发行平台币的流程。

---

## 为什么选择solana

* 1、速度快；
* 2、价格便宜；

## 元数据token

直接用solana-cli来创建token，没办法上传元数据，就是在没办法展示logo、symbol、name。可以用过官网推荐的umi框架来进行元数据的创建，比较简单。

* 第一步、导包

```
"dependencies": {
    "@metaplex-foundation/mpl-token-metadata": "^3.2.1",
    "@metaplex-foundation/umi": "^0.9.1",
    "@metaplex-foundation/umi-bundle-defaults": "^0.9.1",
    "@solana/web3.js": "^1.90.0"
  }
```

---

* 第二步、上传logo.png到ipfs
  
  图片信息需要能够信息在线化，上传的ipfs网络，我自己用的是pinata，可自行选择。
  登录地址（pinata）：https://app.pinata.cloud/pinmanager。
  上传logo以后，需要复制logo的ipfs地址，就是一个url。

---

* 第三步、自定义一个token元数据文件，名字任意（token_info.json）。

```
{
    "name":"Lao A Coin",
    "symbol":"LaoA",
    "description":"[宇智波Lao,如来佛祖]",
    "image":"https://aqua-kind-donkey-807.mypinata.cloud/ipfs/QmYZ7PZK3QyTZcnjEGjP1Xr2JErfELXR6hggdoLkKHWexf"
}
```

这里的image，就是第二步中的logo的ipfs地址。
编程完成以后，同样的上传到ipfs网络

---

* 第四步、编写js
  导包：

```
"dependencies": {
    "@metaplex-foundation/mpl-token-metadata": "^3.2.1",
    "@metaplex-foundation/umi": "^0.9.1",
    "@metaplex-foundation/umi-bundle-defaults": "^0.9.1",
    "@solana/web3.js": "^1.90.0"
  }
```

编码：

```
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
```

