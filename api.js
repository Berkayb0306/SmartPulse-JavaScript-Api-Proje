const axios = require('axios');
const ExcelJS = require ('exceljs');

function apiDate(startDate,endDate) {
    const apiUrl = `https://seffaflik.epias.com.tr/transparency/service/market/intra-day-trade-history?endDate=${endDate}&startDate=${startDate}`;


return axios.get(apiUrl)
.then (response =>{
    const data = response.data;

    data.body.intraDayTradeHistoryList
    .filter(conract => conract.conract.startsWith('PH'))
    .forEach(conract => {
        const year = '20' + conract.conract.substring(2,4);
        const month = conract.conract.substring(4,6);
        const day = conract.conract.substring(6,8);
        const hour = conract.conract.substring(8,10) + ':00';

        const dateString = `${year}-${month}-${day}T${hour}`;
        conract.transDateTime = new Date(dateString);
        
        });
    const filtreleme = data.body.intraDayTradeHistoryList
        .filter(conract =>conract.transDateTime )
        .sort ((a,b) => a.transDateTime - b.transDateTime); 
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sonuçlar');

    worksheet.addRow(['Tarih', 'Toplam İşlem Miktarı(MWh)', 'Toplam İşlem Tutarı(TL)', 'Ağırlıklı Ortalama Fiyat(TL/MWh)']);
    worksheet.columns =[20,25,25,30].map(width => ({width}));

    filtreleme.forEach(conract => {
        const Toplam_İşlem_Miktari = conract.quantity / 10 ;
        const Toplam_İşlem_Tutari = (conract.price * conract.quantity)/10 ;
        const Agırlıklı_Ortalama_Fiyat = Toplam_İşlem_Tutari/Toplam_İşlem_Miktari ;

        worksheet.addRow([
            conract.transDateTime.toLocaleString(),
            Toplam_İşlem_Miktari.toFixed(2),
            Toplam_İşlem_Tutari.toFixed(2),
            Agırlıklı_Ortalama_Fiyat.toFixed(2),
        ]);
    });
    
    return workbook.xlsx.writeFile('Sonuçlar.xlsx');
    })
.then(()=> console.log('Excel Dosyası Oluşturuldu Sonuçları Ordan kontrol edebilirsiniz : Sonuçlar.xlsx'))

}

const startDate = '2023-11-24';
const endDate = '2023-11-25';

apiDate (startDate,endDate);





