'use strict'

const bcrypt = require('bcrypt')

exports.generatePassword =  async (v) => {
  if (v !== undefined)
  {
    const hash = await bcrypt.hash(v, 10);
    return hash
  }
}

exports.verifPassword = async (v,k)=>{
  return await bcrypt.compare(v,k)
}

exports.generateMessage = async(data,_is_type)=>{
  let _temp = ''
  let _now =  new Date().getHours()
  let _defaultList = `1. Ingin Membuat PO
2. Track PO
3. Konfirmasi Pembayaran
4. Registrasi Account
5. Perubahan Nomor WA
6. Perubahan Detail PO`

if (_is_type == 'admin' && data?.dataValues?.odrStatuses == 'on payment')
  {
    let _isPayment = data.dataValues.odrStatuses == 'on payment' ? `Silakan dilakukan pembayaran ke : *000000* \nInvoice akan auto cancel jika belum dilakukan pembayaran lebih dari *1 jam* \nJika sudah membayar bisa reply chat *#(nomorPO)*\n` : ''
    let _detail = data.dataValues.orderlines.map((v)=> { return `- ${v.products.dataValues.name} : ${parseInt(v.dataValues.total_order)}pcs x ${formatNumber(v.dataValues.amount)} `
        }).join('\n')
    _temp = `Selamat ${startTime(parseInt(_now))}, kami dari admin *@RajaCireng*. Ingin menginfokan bahwa mas mbak memiliki order atas *${data.dataValues.ponumber}*.\n
${_detail}
\n*Grand Total* : Rp. ${formatNumber(data.dataValues.amount)}\n
${_isPayment}\n
Terima kasih ${data.dataValues.odrStatuses != 'on payment' ? ' dan selamat menikmati\n@AdminRajaCireng ': ''} `
  }
  if (_is_type == 'contact admin'){
    _temp = `Selamat ${startTime(parseInt(_now))}, terima kasih telah menghubungi *@RajaCireng*.\n
${_defaultList}\n
Bisa dipilih salah satu request nya ya mas mbak`
  }
  return _temp.trimStart()
}

let startTime = (int)=>{
  return int <= 10 ? 'Pagi' : int > 10 && int <= 14 ? 'Siang' : int > 14 && int <= 18 ? 'Sore' : 'Malam'
}

let formatNumber = (decimal)=>{
  let _v = parseFloat(decimal).toFixed(2)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
    _v,
  )

}

