
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6IjRiZDIwM2Q4LTZkY2QtNGE4MC1iYjdlLTg2NDVlNzM2Y2NjNyIsInVzZXJfdHlwZSI6Ik1lcmNoYW50IiwiaWF0IjoxNzQwNjE2NDgxLCJleHAiOjE3NzIxNTI0ODF9.Ty61wohypWK4tcXIWJow7uK-SmKOALAoQ8vz_9uHQxk"



const transferconfirmationsby = async function (
  da,
  TransactionsV2, // Assuming this is a Sequelize model
  accountFroms,
  auth
) {
  try {
    // 1.  สร้าง data สำหรับ request
    const data = JSON.stringify({
      accountTo: TransactionsV2.members.bankAccountNumber,
      accountNo: accountFroms.accountNumber,
      api_auth: auth,
      amount: TransactionsV2.amount,
      accountToBankCode: TransactionsV2.bank.scb_code,
    });

    // 2. กำหนด config สำหรับ axios
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://scb.promplayvip.com/scbeasy/transfer/verificationv2",
      headers: {
        "Content-Type": "application/json",
         'Authorization': `Bearer ${token}`
      },
      data: data,
    };

    // 3. ส่ง request ด้วย axios
    const response = await axios.request(config);

    // 4.  สร้าง data สำหรับบันทึก transaction (datasaves)
    //     (ควรดึงข้อมูลที่จำเป็นจาก response)
    //     (ตัวอย่างนี้ใช้ data จากตัวแปร body, dataposts ซึ่งไม่ได้กำหนดไว้
    //      ควรแก้ไขให้ถูกต้อง)
    let datasaves = {
      transaction_id: body.data_req.id,
      recipientName: body.data_req.members.bankAccountName,
      recipientAccount: body.data_req.members.bankAccountNumber,
      amount: body.data_req.amount,
      remark: "",
      recipientBank: body.data_api.dataapi.data.accountFromName,
      senderAccount: body.data_api.dataapi.data.accountFromName,
      qrString: dataposts.data.data.additionalMetaData.paymentInfo[0].QRstring,
      transactionId: dataposts.data.data.transactionId,
      transactionDateTime: dataposts.data.data.transactionDateTime,
      status: "success",
      description: "",
      reqby_admin_id: 4,
      ref: "",
      member_id: body.data_req.members.id,
    };

    // 5. บันทึก transaction
    let saveTransaction_withdraw = await saveTransaction(datasaves);

    // 6. อัพเดท status ของ transaction เดิม
    await TransactionsV2.update(
      {
        status: "success",
      },
      {
        where: { id: body.data_req.id },
      }
    );

    // 7. ดึงข้อมูล transaction ที่บันทึกใหม่
    let datausers = await Transaction_withdraw.findOne({
      include: [
        {
          as: "members",
          model: Member, // Assuming this is a Sequelize model
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
          required: true,
        },
        {
          model: TransactionsV2,
          as: "Transactions",
          attributes: {
            include: [],
            exclude: ["deleted_at", "created_at", "updated_at"],
          },
        },
      ],

      where: {
        id: saveTransaction_withdraw.id,
      },
    });

    // ... (โค้ดส่วนอื่นๆ) ...
  } catch (error) {
    console.error("Error in transferconfirmationsby:", error);
    // Handle the error appropriately, e.g., send an error response
  }
};
