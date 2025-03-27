/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { ethers } from 'ethers';
import React from 'react'
import { abi as NFT_ABI } from '@/contracts/SampleERC721.json'
//@ts-expect-error no module
import hexer from 'browser-string-hexer';


const chain =[
    "https://bsc-testnet-rpc.publicnode.com",
    "https://blockchain.googleapis.com/v1/projects/map-blog-2e29d/locations/asia-east1/endpoints/ethereum-sepolia/rpc?key=AIzaSyCWrwgD9Agj-KrOM1tQ6A2hUV8lU4QzuKg"
]

const provider = new ethers.JsonRpcProvider(chain[0])
//Ví  owner contract, để test việc add whitelist;
const wallet = new ethers.Wallet("046b0f39761b1667b4e29940c00eeb776358042a10354b5fe7a837a38083f2dd", provider)


const nftContract = new ethers.Contract("0x8673cD93f30A9B86caDDE736898D2c5fCa6eF65f", NFT_ABI, wallet)

// NODEJS có thể thay thế window.ethereum bằng ethers.providers.JsonRpcProvider
// const provider = new ethers.providers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com');
// PrivateKey
// const wallet = new ethers.Wallet("046b0f39761b1667b4e29940c00eeb776358042a10354b5fe7a837a38083f2dd", provider)
// const nftContract = new ethers.Contract("0x8673cD93f30A9B86caDDE736898D2c5fCa6eF65f", NFT_ABI, wallet)

const Page = () => {
    const [attr, setAttr] = React.useState<{
        id: string,
        key: string,
        value: string
    }[]>([
        {
            id: Math.random().toString(),
            key: '',
            value: ''
        }
    ])

    const [nftId] = React.useState<string>('1')
    const [address, setAddress] = React.useState<string>('')

    const [nftResult, setNftResult] = React.useState<any>(null)

    const [loadingWhitelist, setLoadingWhitelist] = React.useState<boolean>(false)
    const [wlhash, setWlhash] = React.useState<string>('')



    const add = () => {
        setAttr([
            ...attr,
            {
                id: Math.random().toString(),
                key: '',
                value: ''
            }
        ])
    }

    const connectWallet = async () => {
        const wallets = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(wallets[0])
    }


    const addWhiteList = async () => {
        if(!nftId) {
            alert('Nhập ID NFT')
            return
        }
        setLoadingWhitelist(true)
        const tx = await nftContract.addToWhitelist(nftId, ethers.getAddress(address));
        const receipt = await tx.wait();
        setWlhash(receipt.hash)
        setLoadingWhitelist(false)
    }

    const onFetchVerificationData = async () => {
        if (!nftId) {
            alert('Nhập ID NFT')
            return
        }

        if(!address) {
            alert('Kết nối wallet') 
            return;
        }


        const hex = hexer("Get verification");
        
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [hex, address]
        });

        console.log(`🐳 -> onFetchVerificationData -> signature:`, signature)
        

        const verificationData = await nftContract.getVerificationData(Number(nftId), signature);

        // Extract the verification source address and the data items
        const [verificationSource, items] = verificationData;

        setNftResult({
            verificationSource,
            items
        })
    }

    return (
        <div className='w-full h-screen flex container gap-10 p-10'>
            <div className="flex-1 flex flex-col gap-4">
                <div className='flex flex-col gap-4'>
                    <div>
                        Kết nối để lấy địa chỉ cần cấp quyền truy cập thông tin <a href="https://sepolia.etherscan.io/token/0x237abcb0a8e652dcc848d88d3db8eced43d67871?a=1">1</a>
                    </div>
                    {address && <div>
                        Đã kết nối: <b>{address}</b>
                    </div>}
                    <button className='btn btn-primary' disabled={loadingWhitelist} onClick={address ? addWhiteList : connectWallet}>{loadingWhitelist ? "Loading..." : address ? "Thêm vào whitelist" : "Connect Wallet"}</button>

                    {wlhash && (
                        <div className="alert alert-success" role="alert">
                            Thành công cấp quyền: <a target='_blank' className='cursor-pointer' href={`https://testnet.bscscan.com/tx/${wlhash}`}>Xem Thông tin TX</a>
                        </div>
                    )}
                </div>

                <div className='flex flex-col gap-4'>
                    Lấy thông tin bằng ID NFT (hiện tại chỉ làm  ID: 1 để demo)
                    <div>
                        <input type="text" className='input' value={nftId} />
                    </div>
                    <button className='btn btn-primary' onClick={onFetchVerificationData}>Láy thông tin</button>

                    {nftResult && <pre>
                        {JSON.stringify(nftResult, null, 2)}
                    </pre>}
                </div>
            </div>


            <div className="flex-1">
                Xác minh user on-chain
                <div className='flex flex-col gap-4'>
                    {attr.map((a) => {
                        return (
                            (
                                <div key={a.id} className='flex gap-4'>
                                    <div>
                                        <div>Thông tin: </div>
                                        <input type="text" className='input' />
                                    </div>
                                    <div>
                                        <div>Giá trị: </div>
                                        <input type="text" className='input' />
                                    </div>
                                </div>
                            )
                        )
                    })}

                    <div className='flex gap-4'>
                        <button className='btn btn-primary' onClick={add}>
                            +
                        </button>
                        <button className='btn btn-primary'>
                            Xác minh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page