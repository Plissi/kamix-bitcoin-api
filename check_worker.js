require("dotenv").config();

module.exports = async (block, error)=>{
    const Check = require('./model/CheckBlock')
    try {
        find = await Check.find({height: block}).countDocuments()
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
            } catch (e) {
                console.log(e)
            }
            return false
        }else{
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
            } catch (e) {
                console.log(e)
            }
            return true
        }
    } catch (e) {
        if (e) throw e
    }
}

