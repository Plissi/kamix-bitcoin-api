const Check = require('../model/CheckBlock')

module.exports = async (block, error)=>{ 
    return new Promise(result => {
        Check.findOne({'height': block}).countDocuments().then(async (find)=>{
            if (find == 0){
                let begin = new Date() 
                let data = {
                    height: block,
                    et: 0,
                    comment: "Processing",
                    start: begin.getHours()+":"+begin.getMinutes()+":"+begin.getSeconds(),
                    end: "",
                    ee: 0
                }
                try {
                    await Check.create(data)
                    result(false)
                } catch (e) {
                    console.log(e)
                }
            }else if (find == 1){
                let finish = new Date() 
                try {
                    let checkline = await Check.findOne({'height': block})
                    checkline.end = finish.getHours()+":"+finish.getMinutes()+":"+finish.getSeconds()
                    if (error){
                        checkline.ee = 1
                        checkline.comment = error
                    }else{
                        checkline.et = 1
                    }
                    await checkline.save()
                    result(true)
                } catch (e) {
                    console.log(e)
                }
            }
        }).catch((err) => {
            if (err) console.log(block, 'error', err)
        }) 
    })
}

