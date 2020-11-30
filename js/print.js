"use strict";
window.onload = function () {
    const Print = document.getElementById('print')
    const design = document.getElementById('design')

    design.onclick = function () {
        window.location.href = 'design.html'
    }

    function GetQueryString (name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    let id = GetQueryString('id')
    let fdbh = GetQueryString('fdbh')

    let result
    setTimeout(() => {
        $.ajax({
            type: 'POST',
            url: "http://api.mzsale.cn/mzsale/web/labels/print",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                "vtype": "labelprint",
                "item1": id,
                "item2": fdbh
            }),
            async: false,
            success: function (data) {
                result = data
            },
        })

        // 如果没找到 返回
        if (result.Table[0].result == 'warning') return alert('未找到对应的模板和门店编号')
        result.Table[0].dysl -= 1
        // ES6 Object.values兼容
        if (!Object.values) Object.values = function (obj) {
            if (obj !== Object(obj))
                throw new TypeError('Object.values called on a non-object');
            var val = [], key;
            for (key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    val.push(obj[key]);
                }
            }
            return val;
        }

        // 打印格式
        let printformat
        if (result.Table1[0].printformat) {
            printformat = JSON.parse(htmlDecode(result.Table1[0].printformat))
        }

        // 打印模板预览随行列数的改动而变化
        const cVal = document.getElementById('dataColumn')
        const lrVal = document.getElementById('dataLR')
        const tbVal = document.getElementById('dataTB')
        const tpVal = document.getElementById('dataTP')
        const plVal = document.getElementById('dataPL')
        const hVal = document.getElementById('dataH')
        const wVal = document.getElementById('dataW')

        $("#dataLR").val(printformat.boxLR)
        $("#dataTB").val(printformat.boxTB)
        $("#dataTP").val(printformat.boxTP)
        $("#dataPL").val(printformat.boxPL)
        $("#dataColumn").val(printformat.column)
        $("#dataW").val(printformat.boxWidth)
        $("#dataH").val(printformat.boxHeight)
        $("#demo").width(printformat.boxWidth)
        $("#demo").height(printformat.boxHeight)
        // 初始化打印数据预览模板
        modalContent(printformat.column, printformat.boxLR, printformat.boxTB, printformat.boxTP, printformat.boxPL)

        let cValue, lrValue, tbValue, tpValue, plValue
        cVal.oninput = function () {
            modalChange()
        }

        lrVal.oninput = function () {
            modalChange()
        }

        tbVal.oninput = function () {
            modalChange()
        }

        tpVal.oninput = function () {
            modalChange()
        }

        plVal.oninput = function () {
            modalChange()
        }

        hVal.onchange = function () {
            modalChange()
        }

        wVal.onchange = function () {
            modalChange()
        }

        function modalChange () {
            cValue = $("#dataColumn").val()
            lrValue = $("#dataLR").val()
            tbValue = $("#dataTB").val()
            tpValue = $("#dataTP").val()
            plValue = $("#dataPL").val()
            modalContent(cValue, lrValue, tbValue, tpValue, plValue)
        }

        // 初始化预览
        function modalContent (cValue, lrValue, tbValue, tpValue, plValue) {
            const firstBox = document.getElementById('demo')
            let chooseData = result.Table
            let tmpl = result.Table1
            let dataVal = Object.values(chooseData)
            let height = firstBox.style.height
            let width = firstBox.style.width
            let boxheight = height.slice(0, height.length - 2)
            let boxwidth = width.slice(0, width.length - 2)

            if (chooseData.length < 10) {
                creatTmpl(tmpl, chooseData.length)
            } else {
                creatTmpl(tmpl, 10)
            }

            // 模板内容生成
            function creatTmpl (tmpl, lens) {
                let x = $("#needPrint").children()
                for (var i = 0; i < x.length; i++) {
                    if (x[i].id !== 'demo') [
                        x[i].remove()
                    ]
                }

                let data = JSON.parse(htmlDecode(tmpl[0].templatecontent))
                let a = data.code.split('</div>')
                let b = a.slice(0, a.length - 1).join('</div>')
                $("#needPrint").append(b)
                for (let l = 0; l < data.allNum; l++) {
                    if (document.getElementById('text' + l)) {
                    }

                    if (document.getElementById('BarCode' + l)) {
                        JsBarcode("#BarCode" + l, 'default', {
                            width: 1,
                            height: 10,
                            font: 'Sans-serif'
                        })
                    }

                    if (document.getElementById('QrCode' + l)) {
                        QRCode.toCanvas(document.getElementById('QarCode' + l), 'default', {
                            margin: 1,
                            width: 64
                        })
                    }

                    if (document.getElementById('lineDiv' + l)) {
                    }

                    if (document.getElementById('boxDiv' + l)) {
                    }
                }

                const pageText = $("#needPrint").children("div .editable");
                const pageBarCode = $("#needPrint").children("div .BarCodedbclick");
                const pageQarCode = $("#needPrint").children("div .QarCodedbclick");
                const pageLine = $("#needPrint").children("div .Line");
                const pageBox = $("#needPrint").children("div .Box");
                creatTmplBarCode(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens)
                creatTmplQarCode(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens)
                creatTmplText(cValue, chooseData, boxheight, boxwidth, dataVal, lrValue, tbValue, tpValue, plValue, lens)
                creatTmplLine(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens)
                creatTmplBoxDiv(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens)
                // 一维码批量生成
                function creatTmplBarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens) {
                    let nums = 1000
                    let spacing = 0
                    let status = 1
                    let cv = columnVal
                    for (var i = 0; i < 1; i++) {
                        let newBarCode = pageBarCode.clone()
                        if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                        for (var name in data[0]) {
                            if (name == 'smm') {
                                let n = newBarCode[0].id.slice(newBarCode[0].id.length - 1, newBarCode[0].id.length)
                                if (data[0].smm.length == 13) {
                                    JsBarcode("#BarCode" + n, data[0].smm, {
                                        format: 'EAN13',
                                        height: 40,
                                        width: 1,
                                        font: 'Sans-serif',
                                        fontOption: 'bold',
                                        fontSize: 14
                                    })
                                }
                                else {
                                    JsBarcode("#BarCode" + n, data[0].smm, {
                                        format: 'CODE128',
                                        height: 40,
                                        width: 1,
                                        font: 'Sans-serif',
                                        fontOption: 'bold',
                                        fontSize: 14
                                    })
                                }
                            }
                        }

                    }
                    // 第一层循环 => 处理所选数据数量
                    for (var i = 0; i < lens; i++) {
                        // 拷贝模板元素 如果不存在 返回
                        let newBarCode = pageBarCode.clone()
                        if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                        // 第二层循环 => 找到每条数据中的条码值
                        for (var name in data[i]) {
                            if (name == 'smm') {
                                // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                                for (var j = 0; j < data[i].dysl; j++) {
                                    // 列数判断
                                    if (status >= cv) {
                                        status = 0
                                        spacing++
                                    }
                                    // 以模板元素各属性为基础进行复制
                                    let BarCode = newBarCode.clone()
                                    // Code
                                    BarCode[0].id = BarCode[0].id.slice(0, BarCode[0].id.length - 1) + nums
                                    // top
                                    BarCode[0].style.top =
                                        Number(BarCode[0].style.top.slice(0, BarCode[0].style.top.length - 2)) +
                                        Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                                    // left
                                    BarCode[0].style.left =
                                        Number(BarCode[0].style.left.slice(0, BarCode[0].style.left.length - 2)) +
                                        Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'
                                    // BarCode
                                    BarCode[0].firstElementChild.id =
                                        BarCode[0].firstElementChild.id.slice(0, BarCode[0].firstElementChild.id.length - 1) + nums

                                    $("#needPrint").append(BarCode[0])
                                    document.getElementById('needPrint').style.height = BarCode[0].style.top
                                    document.getElementById('needPrint').style.width = BarCode[0].style.left
                                    if (data[i].smm.length == 13) {
                                        JsBarcode("#BarCode" + nums, data[i].smm, {
                                            format: 'EAN13',
                                            height: 40,
                                            width: 1,
                                            font: 'Sans-serif',
                                            fontOption: 'bold',
                                            fontSize: 14
                                        })
                                    }
                                    else {
                                        JsBarcode("#BarCode" + nums, data[i].smm, {
                                            format: 'CODE128',
                                            height: 40,
                                            width: 1,
                                            font: 'Sans-serif',
                                            fontOption: 'bold',
                                            fontSize: 14
                                        })
                                    }
                                    nums--
                                    status++
                                }
                            }
                        }
                    }
                }
                // 二维码批量生成
                function creatTmplQarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens) {
                    let nums = 1000
                    let spacing = 0
                    let status = 1
                    let cv = columnVal
                    for (var i = 0; i < 1; i++) {
                        let newQarCode = pageQarCode.clone()
                        if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                        for (var name in data[0]) {
                            if (name == 'smm') {
                                let n = newQarCode[0].id.slice(newQarCode[0].id.length - 1, newQarCode[0].id.length)
                                QRCode.toCanvas(document.getElementById("QarCode" + n), data[0].smm, {
                                    margin: 1,
                                    width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                                })
                            }
                        }
                    }
                    // 第一层循环 => 处理所选数据数量
                    for (var i = 0; i < lens; i++) {
                        // 拷贝模板元素 如果不存在 返回
                        let newQarCode = pageQarCode.clone()
                        if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                        // 第二层循环 => 找到每条数据中的条码值
                        for (var name in data[i]) {
                            if (name == 'smm') {
                                // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                                for (var j = 0; j < data[i].dysl; j++) {
                                    // 列数判断
                                    if (status >= cv) {
                                        status = 0
                                        spacing++
                                    }
                                    // 以模板元素各属性为基础进行复制
                                    let QarCode = newQarCode.clone()
                                    // Code
                                    QarCode[0].id = QarCode[0].id.slice(0, QarCode[0].id.length - 1) + nums
                                    // top
                                    QarCode[0].style.top =
                                        Number(QarCode[0].style.top.slice(0, QarCode[0].style.top.length - 2)) +
                                        Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                                    // left
                                    QarCode[0].style.left =
                                        Number(QarCode[0].style.left.slice(0, QarCode[0].style.left.length - 2)) +
                                        Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'
                                    // BarCode
                                    QarCode[0].firstElementChild.id =
                                        QarCode[0].firstElementChild.id.slice(0, QarCode[0].firstElementChild.id.length - 1) + nums

                                    $("#needPrint").append(QarCode[0])
                                    QRCode.toCanvas(document.getElementById("QarCode" + nums), data[i].smm, {
                                        margin: 1,
                                        width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                                    })
                                    nums--
                                    status++
                                }
                            }
                        }
                    }
                }
                // 文本批量生成
                function creatTmplText (columnVal, data, boxheight, boxwidth, textDataVal, lrValue, tbValue, tpValue, plValue, lens) {
                    // 处理模板数据
                    let newText = pageText.clone()
                    let nums = 1000
                    let spacing = 0
                    let status = 1
                    let cv = columnVal
                    for (let i = 0; i < pageText.length; i++) {
                        pageText[i].firstChild.innerHTML = `${textDataVal[0][pageText[i].dataset.text]}`
                    }
                    // 第一层循环 => 处理所选数据
                    for (var j = 0; j < lens; j++) {
                        // 第二层循环 => 根据文本框 dysl 值进行复制
                        for (var k = 0; k < data[j].dysl; k++) {
                            let num = j
                            // 第三层循环 => 根据模板文本框数量批量生成
                            for (var c = 0; c < newText.length; c++) {
                                let text = newText.clone()
                                if (status >= cv) {
                                    status = 0
                                    spacing++
                                }
                                // top
                                text[c].style.top =
                                    Number(text[c].style.top.slice(0, text[c].style.top.length - 2)) +
                                    Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                                // left
                                text[c].style.left =
                                    Number(text[c].style.left.slice(0, text[c].style.left.length - 2)) +
                                    Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'

                                text[c].style.fontWight = 'bold'
                                text[c].style.fontSize = '16px'
                                // text
                                text[c].firstChild.innerHTML = `${textDataVal[j][text[c].dataset.text]}`;

                                text[c].firstChild.setAttribute('style', 'word-wrap:break-word;')
                                text[c].firstChild.setAttribute('style', `width:${boxwidth}px`)

                                $("#needPrint").append(text[c])
                                nums--
                            }
                            status++
                        }
                    }
                    $("#tableview").modal('hide')
                }
                // 线条批量生成
                function creatTmplLine (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens) {
                    let newLine = pageLine.clone()
                    let spacing = 0
                    let status = 1
                    let cv = columnVal
                    if (newLine.length <= 0) return (console.warn('线条模板不存在'))
                    // 第一层循环 => 处理所选数据
                    for (var i = 0; i < lens; i++) {
                        // 第二层循环 => 根据数据 dysl值进行复制
                        for (var j = 0; j < data[i].dysl; j++) {
                            // 第三层 => 根据模板数据进行生成
                            for (var c = 0; c < newLine.length; c++) {
                                let line = newLine.clone()
                                if (status >= cv) {
                                    status = 0
                                    spacing++
                                }
                                // top
                                line[c].style.top =
                                    Number(line[c].style.top.slice(0, line[c].style.top.length - 2)) +
                                    Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                                // left
                                line[c].style.left =
                                    Number(line[c].style.left.slice(0, line[c].style.left.length - 2)) +
                                    Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'
                                $("#needPrint").append(line[c])
                            }
                            status++
                        }
                    }
                }
                // 边框批量生成
                function creatTmplBoxDiv (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue, lens) {
                    let newBox = pageBox.clone()
                    let spacing = 0
                    let status = 1
                    let cv = columnVal
                    if (newBox.length <= 0) return (console.warn('边框模板不存在'))
                    // 第一层循环 => 处理所选数据
                    for (var i = 0; i < lens; i++) {
                        // 第二层循环 => 根据数据 dysl值进行复制
                        for (var j = 0; j < data[i].dysl; j++) {
                            // 第三层 => 根据模板数据进行生成
                            for (var c = 0; c < newBox.length; c++) {
                                let line = newBox.clone()
                                if (status >= cv) {
                                    status = 0
                                    spacing++
                                }
                                // top
                                line[0].style.top =
                                    Number(line[0].style.top.slice(0, line[0].style.top.length - 2)) +
                                    Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                                // left
                                line[0].style.left =
                                    Number(line[0].style.left.slice(0, line[0].style.left.length - 2)) +
                                    Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'

                                $("#needPrint").append(line[0])
                            }
                            status++
                        }
                    }
                }
            }
        }
    }, 1000);

    // 模板打印
    Print.onclick = function () {
        // 数据
        const chooseData = result.Table
        const tmpl = result.Table1
        const textDataVal = Object.values(chooseData)
        // 创建模板数据
        creatTmpl(tmpl)
        // 获取列值
        const cValue = $("#dataColumn").val()
        // 获取模板
        const pageText = $("#needPrint").children("div .editable");
        const pageBarCode = $("#needPrint").children("div .BarCodedbclick");
        const pageQarCode = $("#needPrint").children("div .QarCodedbclick");
        const pageLine = $("#needPrint").children("div .Line");
        const pageBox = $("#needPrint").children("div .Box");
        // 获取模板框及宽度
        const firstBox = document.getElementById("demo");
        let height = firstBox.style.height;
        let width = firstBox.style.width
        let boxheight = height.slice(0, height.length - 2);
        let boxwidth = width.slice(0, width.length - 2)
        let c = $("#dataColumn").val()
        let lr = $("#dataLR").val()
        let tb = $("#dataTB").val()
        let tp = $("#dataTP").val()
        let pl = $("#dataPL").val()
        // 组件生成
        creatTmplBarCode(c, chooseData, boxheight, boxwidth, lr, tb, tp, pl)
        creatTmplQarCode(c, chooseData, boxheight, boxwidth, lr, tb, tp, pl)
        creatTmplText(c, chooseData, boxheight, boxwidth, textDataVal, lr, tb, tp, pl)
        creatTmplLine(c, chooseData, boxheight, boxwidth, lr, tb, tp, pl)
        creatTmplBoxDiv(c, chooseData, boxheight, boxwidth, lr, tb, tp, pl)
        Print()
        // 模板内容生成
        function creatTmpl (tmpl) {
            let x = $("#needPrint").children()
            for (var i = 0; i < x.length; i++) {
                if (x[i].id !== 'demo') [
                    x[i].remove()
                ]
            }

            let data = JSON.parse(htmlDecode(tmpl[0].templatecontent))
            let a = data.code.split('</div>')
            let b = a.slice(0, a.length - 1).join('</div>')
            $("#needPrint").append(b)
            for (let l = 0; l < data.allNum; l++) {
                if (document.getElementById('BarCode' + l)) {
                    JsBarcode("#BarCode" + l, 'default', {
                        width: 1,
                        height: 10,
                        font: 'Sans-serif'
                    })
                }

                if (document.getElementById('QrCode' + l)) {
                    QRCode.toCanvas(document.getElementById('QarCode' + l), 'default', {
                        margin: 1,
                        width: 64
                    })
                }
            }
        }
        // 一维码批量生成
        function creatTmplBarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue) {
            let nums = 1000
            let spacing = 0
            let status = 1
            let cv = columnVal
            for (var i = 0; i < 1; i++) {
                console.log(`处理模板数据`)
                let newBarCode = pageBarCode.clone()
                if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                for (var name in data[0]) {
                    if (name == 'smm') {
                        let n = newBarCode[0].id.slice(newBarCode[0].id.length - 1, newBarCode[0].id.length)
                        if (data[0].smm.length == 13) {
                            JsBarcode("#BarCode" + n, data[0].smm, {
                                format: 'EAN13',
                                height: 40,
                                width: 1,
                                font: 'Sans-serif',
                                fontOption: 'bold',
                                fontSize: 14
                            })
                        }
                        else {
                            JsBarcode("#BarCode" + n, data[0].smm, {
                                format: 'CODE128',
                                height: 40,
                                width: 1,
                                font: 'Sans-serif',
                                fontOption: 'bold',
                                fontSize: 14
                            })
                        }
                    }
                }
            }
            // 第一层循环 => 处理所选数据数量
            let len = data.length
            for (var i = 0; i < len; i++) {
                // 拷贝模板元素 如果不存在 返回
                let newBarCode = pageBarCode.clone()
                if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                // 第二层循环 => 找到每条数据中的条码值
                for (var name in data[i]) {
                    if (name == 'smm') {
                        // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                        for (var j = 0; j < data[i].dysl; j++) {
                            // 列数判断
                            if (status >= cv) {
                                status = 0
                                spacing++
                            }
                            // 以模板元素各属性为基础进行复制
                            let BarCode = newBarCode.clone()
                            // Code
                            BarCode[0].id = BarCode[0].id.slice(0, BarCode[0].id.length - 1) + nums
                            // top
                            BarCode[0].style.top =
                                Number(BarCode[0].style.top.slice(0, BarCode[0].style.top.length - 2)) +
                                Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                            // left
                            BarCode[0].style.left =
                                Number(BarCode[0].style.left.slice(0, BarCode[0].style.left.length - 2)) +
                                Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'
                            // BarCode
                            BarCode[0].firstElementChild.id =
                                BarCode[0].firstElementChild.id.slice(0, BarCode[0].firstElementChild.id.length - 1) + nums

                            $("#needPrint").append(BarCode[0])
                            document.getElementById('needPrint').style.height = BarCode[0].style.top
                            document.getElementById('needPrint').style.width = BarCode[0].style.left
                            if (data[i].smm.length == 13) {
                                JsBarcode("#BarCode" + nums, data[i].smm, {
                                    format: 'EAN13',
                                    height: 40,
                                    width: 1,
                                    font: 'Sans-serif',
                                    fontOption: 'bold',
                                    fontSize: 14
                                })
                            }
                            else {
                                JsBarcode("#BarCode" + nums, data[i].smm, {
                                    format: 'CODE128',
                                    height: 40,
                                    width: 1,
                                    font: 'Sans-serif',
                                    fontOption: 'bold',
                                    fontSize: 14
                                })
                            }
                            nums--
                            status++
                        }
                    }
                }
            }
        }
        // 二维码批量生成
        function creatTmplQarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue) {
            let nums = 1000
            let spacing = 0
            let status = 1
            let cv = columnVal
            for (var i = 0; i < 1; i++) {
                let newQarCode = pageQarCode.clone()
                if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                for (var name in data[0]) {
                    if (name == 'smm') {
                        let n = newQarCode[0].id.slice(newQarCode[0].id.length - 1, newQarCode[0].id.length)
                        QRCode.toCanvas(document.getElementById("QarCode" + n), data[0].smm, {
                            margin: 1,
                            width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                        })
                    }
                }
            }
            // 第一层循环 => 处理所选数据数量
            let len = data.length
            for (var i = 0; i < len; i++) {
                // 拷贝模板元素 如果不存在 返回
                let newQarCode = pageQarCode.clone()
                if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                // 第二层循环 => 找到每条数据中的条码值
                for (var name in data[i]) {
                    if (name == 'smm') {
                        // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                        for (var j = 0; j < data[i].dysl; j++) {
                            // 列数判断
                            if (status >= cv) {
                                status = 0
                                spacing++
                            }
                            // 以模板元素各属性为基础进行复制
                            let QarCode = newQarCode.clone()
                            // Code
                            QarCode[0].id = QarCode[0].id.slice(0, QarCode[0].id.length - 1) + nums
                            // top
                            QarCode[0].style.top =
                                Number(QarCode[0].style.top.slice(0, QarCode[0].style.top.length - 2)) +
                                Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                            // left
                            QarCode[0].style.left =
                                Number(QarCode[0].style.left.slice(0, QarCode[0].style.left.length - 2)) +
                                Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'
                            // BarCode
                            QarCode[0].firstElementChild.id =
                                QarCode[0].firstElementChild.id.slice(0, QarCode[0].firstElementChild.id.length - 1) + nums

                            $("#needPrint").append(QarCode[0])
                            QRCode.toCanvas(document.getElementById("QarCode" + nums), data[i].smm, {
                                margin: 1,
                                width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                            })
                            nums--
                            status++
                        }
                    }
                }
            }
        }
        // 文本批量生成
        function creatTmplText (columnVal, data, boxheight, boxwidth, textDataVal, lrValue, tbValue, tpValue, plValue) {
            // 处理模板数据
            let newText = pageText.clone()
            let nums = 1000
            let spacing = 0
            let status = 1
            let cv = columnVal
            for (let i = 0; i < pageText.length; i++) {
                pageText[i].firstChild.innerHTML = `${textDataVal[0][pageText[i].dataset.text]}`
            }
            // 第一层循环 => 处理所选数据
            let len = data.length
            for (var j = 0; j < len; j++) {
                // 第二层循环 => 根据文本框 dysl 值进行复制
                for (var k = 0; k < data[j].dysl; k++) {
                    let num = j
                    // 第三层循环 => 根据模板文本框数量批量生成
                    for (var c = 0; c < newText.length; c++) {
                        let text = newText.clone()
                        if (status >= cv) {
                            status = 0
                            spacing++
                        }
                        // top
                        text[c].style.top =
                            Number(text[c].style.top.slice(0, text[c].style.top.length - 2)) +
                            Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                        // left
                        text[c].style.left =
                            Number(text[c].style.left.slice(0, text[c].style.left.length - 2)) +
                            Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'
                        text[c].style.fontWight = 'bold'
                        text[c].style.fontSize = '16px'
                        // text
                        text[c].firstChild.innerHTML = `${textDataVal[j][text[c].dataset.text]}`;

                        text[c].firstChild.setAttribute('style', 'word-wrap:break-word;')
                        text[c].firstChild.setAttribute('style', `width:${boxwidth}px`)

                        $("#needPrint").append(text[c])
                        nums--
                    }
                    status++
                }
            }
            $("#tableview").modal('hide')
        }
        // 线条批量生成
        function creatTmplLine (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue) {
            let newLine = pageLine.clone()
            let spacing = 0
            let status = 1
            let cv = columnVal
            if (newLine.length <= 0) return (console.warn('线条模板不存在'))
            // 第一层循环 => 处理所选数据
            let len = data.length
            for (var i = 0; i < len; i++) {
                // 第二层循环 => 根据数据 dysl值进行复制
                for (var j = 0; j < data[i].dysl; j++) {
                    // 第三层 => 根据模板数据进行生成
                    for (var c = 0; c < newLine.length; c++) {
                        let line = newLine.clone()
                        if (status >= cv) {
                            status = 0
                            spacing++
                        }
                        // top
                        line[c].style.top =
                            Number(line[c].style.top.slice(0, line[c].style.top.length - 2)) +
                            Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                        // left
                        line[c].style.left =
                            Number(line[c].style.left.slice(0, line[c].style.left.length - 2)) +
                            Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'
                        $("#needPrint").append(line[c])
                    }
                    status++
                }
            }
        }
        // 边框批量生成
        function creatTmplBoxDiv (columnVal, data, boxheight, boxwidth, lrValue, tbValue, tpValue, plValue) {
            let newBox = pageBox.clone()
            let spacing = 0
            let status = 1
            let cv = columnVal
            if (newBox.length <= 0) return (console.warn('边框模板不存在'))
            // 第一层循环 => 处理所选数据
            let len = data.length
            for (var i = 0; i < len; i++) {
                // 第二层循环 => 根据数据 dysl值进行复制
                for (var j = 0; j < data[i].dysl; j++) {
                    // 第三层 => 根据模板数据进行生成
                    for (var c = 0; c < newBox.length; c++) {
                        let line = newBox.clone()
                        if (status >= cv) {
                            status = 0
                            spacing++
                        }
                        // top
                        line[0].style.top =
                            Number(line[0].style.top.slice(0, line[0].style.top.length - 2)) +
                            Number(boxheight * spacing) + Number(tbValue * spacing) + Number(tpValue) + 'px'
                        // left
                        line[0].style.left =
                            Number(line[0].style.left.slice(0, line[0].style.left.length - 2)) +
                            Number(boxwidth * status) + Number(lrValue * status) + Number(plValue) + 'px'

                        $("#needPrint").append(line[0])
                    }
                    status++
                }
            }
        }
        // 打印
        function Print () {
            /* A-1 130 90 1 0 0 0 0 */
            /* A-1 130 90 2 0 0 0 0 */
            /* A-1 130 100 3 0 0 0 0 */
            let width = $("#demo").width() * cValue + lr * 2 + 20
            document.getElementById('needPrint').style.width = width + 'px'
            // 修改 pisition值避免出现打印内容重复
            $("#needPrint").children().css('position', 'absolute')
            let allChildren = $("#needPrint").children()
            for (let i = 0; i < allChildren.length; i++) {
                allChildren[i].style.top =
                    allChildren[i].style.top.slice(0, allChildren[i].style.top.length - 2) - 117 + 'px'


                allChildren[i].style.left =
                    allChildren[i].style.left.slice(0, allChildren[i].style.left.length - 2) - 30 + 'px'
            }

            domtoimage.toSvg(document.getElementById('needPrint'))
                .then(function (dataUrl) {
                    document.getElementById('printImg').src = dataUrl;
                    setTimeout(() => {
                        printJS({
                            printable: "printImg",
                            type: "html",
                            css: 'js/print.css',
                            scanStyles: false
                        });
                    }, 500);
                });
        }
        $("#printmodal").modal('hide')
    };

    /**
     * 模板加载
     * @param {object} a StorageData
     * @param {number} i Storage.length
     * @param {number} n StorageData => text.length
     * @param {number} j StorageData => barcode.length
     * @param {number} k StorageData => qarcode.length
     * @param {number} d StorageData => lineDiv.length
     * @param {number} h StorageData => boxDiv.length
     */

    const templateBtn = document.getElementById("template");
    const allTmpl = (function () {
        let result;
        $.ajax({
            type: 'POST',
            url: "http://api.mzsale.cn/mzsale/web/labels/set",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ "vtype": "showtemplates" }),
            async: false,
            success: function (data) {
                if (data.Table[0].result == 'success') result = data.Table
            }
        })
        return result;
    })();

    // 模板模态框
    templateBtn.onclick = function () {
        if (!allTmpl) return (console.error('Error: 接口故障,请联系管理人员'))
        // 初始化
        $(".modalrow").html('')
        // 生成模板预览
        for (let i = 0; i < allTmpl.length; i++) {
            let data = JSON.parse(htmlDecode(allTmpl[i].templatecontent))
            $(".modalrow")
                .append(`<div class="col-md-4">
    <div class="card mb-4 box-shadow">
        <img id=${'img' + i}
        class="card-img-top"
            data-src="holder.js/100px225?theme=thumb&amp;bg=55595c&amp;fg=eceeef&amp;text=Thumbnail"
            alt="Thumbnail [100%x225]" style="height: 180px; width: 100%; display: block;"
            src=${data.img}
            data-holder-rendered=" true">
        <div class="card-body" style="border-top: 1px solid #6c757d;">
            <span style="margin-left: -10px;;font-size:14px;">${allTmpl[i].templatename}</span>
            <div class="buttonGroup" style="text-align: right;margin-top: -25px;">
                <button type="button" class="btn btn-sm btn-primary" id="${i}">选择</button>
                <button type="button" class="btn btn-sm btn-danger" id="del${i}">删除</button>
            </div>
        </div>
    </div>
</div>`);


            if (allTmpl[i].defaultzt == 'T') {
                $("#del" + i).attr("style", "display:none;");
            }

            let num = i;
            let delId = allTmpl[i].templateid
            // 删除模板
            $("#del" + num).click(function () {
                $.ajax({
                    type: 'POST',
                    url: "http://api.mzsale.cn/mzsale/web/labels/set",
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({ "vtype": "deltemplate", "item1": delId }),
                    async: false,
                    success: function (data) {
                        if (data.Table[0].result == 'success') {
                            location.reload();
                        } else {
                            return (console.error(`模板删除接口故障:${data.Table[0].result}`))
                        }
                    }
                })
            })

            // 加载模板
            $("#" + num).click(function () {
                let x = $("#needPrint").children()
                for (var i = 0; i < x.length; i++) {
                    if (x[i].id !== 'demo') [
                        x[i].remove()
                    ]
                }

                let a = data.code.split('</div>')
                let b = a.slice(0, a.length - 1).join('</div>')
                $("#needPrint").append(b)
                for (let l = 0; l < data.allNum; l++) {
                    if (document.getElementById('text' + l)) {
                        drag(document.getElementById('text' + l), { minSize: 30 })
                    }

                    if (document.getElementById('BarCode' + l)) {
                        JsBarcode("#BarCode" + l, 'default', {
                            width: 1,
                            height: 10,
                            font: 'Sans-serif'
                        })
                        drag(document.getElementById('Code' + l), { minSize: 30 })
                    }

                    if (document.getElementById('QrCode' + l)) {
                        QRCode.toCanvas(document.getElementById('QarCode' + l), 'default', {
                            margin: 1,
                            width: 64
                        })
                        drag(document.getElementById('QrCode' + l), { minSize: 30 })
                    }

                    if (document.getElementById('lineDiv' + l)) {
                        drag(document.getElementById('lineDiv' + l), { minSize: 30 })
                    }

                    if (document.getElementById('boxDiv' + l)) {
                        drag(document.getElementById('boxDiv' + l), { minSize: 30 })
                    }
                }

                // 初始化 ID 避免重复
                n = data.textlength
                j = data.barcode
                k = data.qarcode
                d = data.lineDiv
                h = data.boxDiv

                $("#templatemodel").modal("hide");
            });
        }
        $("#templatemodel").modal({
            backdrop: 'static'
        });
    };
}