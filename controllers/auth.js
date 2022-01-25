exports.login = async (req,res,next) => {
    return res.status(200).json({
        name:'Dimitris',
        last_name:'Tzilopoylos',
        token:'312763128763128',
        amount:400.23,
        email:req.body.email
    })
}

exports.getUser = async (req,res,next) => {
    return res.status(200).json({
        name:'Dimitris',
        last_name:'Tzilopoylos',
        token:'312763128763128',
        amount:400.23,
        email:req.body.email
    })
}