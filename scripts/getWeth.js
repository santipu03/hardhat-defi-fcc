const { getNamedAccounts, ethers } = require("hardhat")

const amount = ethers.utils.parseEther("0.02")

async function getWeth() {
    const { deployer } = await getNamedAccounts()

    // address 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        deployer
    )

    const tx = await iWeth.deposit({ value: amount })
    await tx.wait(1)

    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString() / 10 ** 18} WETH`)
}

module.exports = getWeth
