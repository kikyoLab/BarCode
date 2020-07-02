/* print */

tmplPrint(result.Table, result.Table1)

function tmplPrint (data, tmpl) {
    function creatTmplBarCode () { }
    function creatTmplQarCode () { }
    function creatTmplText () { }
    function creatTmplLine () { }
    function creatTmplBoxDiv () { }
    function creatTmpl () { }

    creatTmpl()
    creatTmplBarCode()
    creatTmplQarCode()
    creatTmplText()
    creatTmplLine()
    creatTmplBoxDiv()
}

/* design */
let test = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
for (var i = 0; i < test.lengtht; i++) {
    console.log(test[i])
}