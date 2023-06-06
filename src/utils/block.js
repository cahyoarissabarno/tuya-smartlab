const axios = require('axios');

try {
  let status = true
  const address = "0x6987d55923a6d9060440e87fc7e3ae427664a157";
  const device_id = 6;
  const page =50
  // const page = 74 //id 5
  // const page = 28 // id 9
  // let page = 63; // id=2
  // let page = 3; //kepencet pas id 3
  // let page = 133; //id=1
  // while (status) {
    axios.get(`http://10.0.2.7:8181/device-test/log/${page}?from=${address}&device_id=${device_id}`)
    .then(function (response) {
        // console.log(response.data)
        if(response.data.length > 0){
          for (let i = 0; i < response.data.length; i++) {
            const data = {
              block_number: response.data[i].blockNumber,
              date: response.data[i].date,
              device_id
            }
            
            axios.post('http://localhost:8000/api/v1/history/block', data)
            .then((result) => {
              console.log(result.data)
            }).catch((err) => {
              console.log(err)
            });
          }
        } else {
          status = false
        }
        console.log(`page ${page} done`)
    })
    .catch(function (error) {
        console.log(error)
    }); 
    // page = page+1
  // }
} catch (e) {
  console.log(e)
}