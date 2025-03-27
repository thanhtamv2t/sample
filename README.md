## Concept lưu trữ và xác thực để truy vấn thông tin onchain

## File liên quan
contracts/Factory.sol

/frontend
chạy lệnh
```
yarn

yarn dev
```

## Hướng dẫn thêm địa chỉ vào whitelist

Để thêm một địa chỉ vào whitelist, bạn cần phải sử dụng ví owner đã được định nghĩa trong biến `wallet`. Chỉ có địa chỉ owner mới có quyền thực hiện thao tác này.

### Các bước thực hiện:

1. Đảm bảo bạn đang kết nối với ví owner
2. Gọi hàm addToWhitelist với địa chỉ cần thêm vào whitelist:

```javascript
// Ví dụ sử dụng web3.js
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
const addressToWhitelist = "0x..."; // Địa chỉ cần thêm vào whitelist

async function addAddressToWhitelist() {
  await contract.methods.addToWhitelist(addressToWhitelist).send({ from: wallet });
  console.log(`Đã thêm ${addressToWhitelist} vào whitelist thành công`);
}
```

### Lưu ý:
- Chỉ có owner/admin mới có quyền thêm địa chỉ vào whitelist
- Kiểm tra xem địa chỉ đã tồn tại trong whitelist chưa trước khi thêm
- Sau khi thêm thành công, địa chỉ sẽ có các quyền đặc biệt theo cấu hình của contract


## Lấy thông tin dựa trên signature

Để lấy dữ liệu từ hợp đồng thông qua hàm `getVerificationData`, bạn cần sử dụng một chữ ký số (signature) để xác thực quyền truy cập. Địa chỉ ký phải đã được thêm vào whitelist cho token ID tương ứng.

### Các bước thực hiện:

1. Kết nối với ví của người dùng
2. Tạo chữ ký số bằng phương thức `personal_sign`
3. Gọi hàm `getVerificationData` với chữ ký đã tạo

### Mã ví dụ:

```javascript
// Kết nối ví người dùng
const connectWallet = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const currentAddress = accounts[0];
  return currentAddress;
}

// Tạo chữ ký từ message "Get verification"
const createSignature = async (address) => {
  // Tạo chuỗi hex từ message
  const message = "Get verification";
  const hexMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));
  
  // Yêu cầu người dùng ký message
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [hexMessage, address]
  });
  
  return signature;
}

// Lấy dữ liệu xác thực từ hợp đồng
const getVerificationData = async (nftId, signature) => {
  // Gọi hàm getVerificationData trên hợp đồng
  const verificationData = await contract.getVerificationData(nftId, signature);
  
  // Phân tích kết quả trả về
  const [verificationSource, items] = verificationData;
  
  return {
    verificationSource, // Địa chỉ nguồn xác thực
    items // Mảng các đối tượng VerificationItem chứa thông tin key-value
  };
}

// Hàm chính để thực hiện toàn bộ quy trình
const fetchVerificationData = async (nftId) => {
  const address = await connectWallet();
  const signature = await createSignature(address);
  const data = await getVerificationData(nftId, signature);
  return data;
}
```

### Lưu ý:

- Địa chỉ ký message phải đã được thêm vào whitelist bởi chủ sở hữu của token
- Chữ ký được tạo ra cụ thể cho message "Get verification"
- Hợp đồng sử dụng phương pháp khôi phục ECDSA để xác minh rằng người ký là người dùng được phép
- Nếu người ký không trong whitelist, giao dịch sẽ revert với lỗi "Signer not whitelisted"
- Dữ liệu trả về bao gồm mảng các bản ghi xác thực, mỗi bản ghi chứa địa chỉ người xác thực và danh sách các cặp key-value


