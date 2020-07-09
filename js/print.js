"use strict";
window.onload = function () {
    const Print = document.getElementById('print')
    const design = document.getElementById('design')

    let url = location.search;
    let theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
        }
    }

    let labId = theRequest.id
    let roomName = theRequest.roomName

    design.onclick = function () {
        window.location.href = 'design.html'
    }

    let result
    $.ajax({
        type: 'POST',
        url: 'http://test.ecsun.cn:99/mzato/main/labels/print',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ "vtype": "labelprint", "item1": labId, "item2": roomName }),
        async: false,
        success: function (data) {
            result = data
        },
    })

    // 如果没找到 返回
    if (result.Table[0].result == 'warning') return alert('未找到对应的模板和门店编号')

    // 打印格式
    let printformat = JSON.parse(htmlDecode(result.Table1[0].printformat))

    // 打印模板预览随行列数的改动而变化
    const cVal = document.getElementById('dataColumn')
    const lrVal = document.getElementById('dataLR')
    const tbVal = document.getElementById('dataTB')
    $("#dataLR").val(printformat.boxLR)
    $("#dataTB").val(printformat.boxTB)
    $("#dataColumn").val(printformat.column)
    $("#dataW").val(printformat.boxWidth)
    $("#dataH").val(printformat.boxHeight)
    $("#demo").width(printformat.boxWidth)
    $("#demo").height(printformat.boxHeight)
    // 初始化打印数据预览模板
    modalContent(printformat.column, printformat.boxLR, printformat.boxTB)

    let cValue, lrValue, tbValue
    cVal.oninput = function () {
        modalChange()
    }

    lrVal.oninput = function () {
        modalChange()
    }

    tbVal.oninput = function () {
        modalChange()
    }

    function modalChange () {
        cValue = $("#dataColumn").val()
        lrValue = $("#dataLR").val()
        tbValue = $("#dataTB").val()
        modalContent(cValue, lrValue, tbValue)
    }

    // 初始化预览
    function modalContent (cValue, lrValue, tbValue) {
        const firstBox = document.getElementById('demo')
        let chooseData = result.Table
        let tmpl = result.Table1
        let dataVal = Object.values(chooseData)
        let height = firstBox.style.height
        let width = firstBox.style.width
        let boxheight = height.slice(0, height.length - 2)
        let boxwidth = width.slice(0, width.length - 2)
        creatTmpl(tmpl)
        // 模板内容生成
        function creatTmpl (tmpl) {
            let x = $("#printmain").children()
            for (var i = 0; i < x.length; i++) {
                if (x[i].id !== 'demo') [
                    x[i].remove()
                ]
            }

            let data = JSON.parse(htmlDecode(tmpl[0].templatecontent))
            let a = data.code.split('</div>')
            let b = a.slice(0, a.length - 1).join('</div>')
            $("#printmain").append(b)
            for (let l = 0; l < data.allNum; l++) {
                if (document.getElementById('text' + l)) {
                    console.log('text++')
                }

                if (document.getElementById('BarCode' + l)) {
                    console.log('barcode++')
                    JsBarcode("#BarCode" + l, 'default', {
                        width: 1,
                        height: 10,
                        font: 'Sans-serif'
                    })
                }

                if (document.getElementById('QrCode' + l)) {
                    console.log('qarcode++')
                    QRCode.toCanvas(document.getElementById('QarCode' + l), 'default', {
                        margin: 1,
                        width: 64
                    })
                }

                if (document.getElementById('lineDiv' + l)) {
                    console.log('line++')
                }

                if (document.getElementById('boxDiv' + l)) {
                    console.log('box++')
                }
            }

            const pageText = $("#printmain").children("div .editable");
            const pageBarCode = $("#printmain").children("div .BarCodedbclick");
            const pageQarCode = $("#printmain").children("div .QarCodedbclick");
            const pageLine = $("#printmain").children("div .Line");
            const pageBox = $("#printmain").children("div .Box");
            creatTmplBarCode(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue)
            creatTmplQarCode(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue)
            creatTmplText(cValue, chooseData, boxheight, boxwidth, dataVal, lrValue, tbValue)
            creatTmplLine(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue)
            creatTmplBoxDiv(cValue, chooseData, boxheight, boxwidth, lrValue, tbValue)
            // 一维码批量生成
            function creatTmplBarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
                console.info('一维码打印✈')
                // 计时器
                console.time('creat-barcode🛴')
                let nums = 1000
                let spacing = 0
                let status = 1
                let cv = columnVal
                console.log(`生成10条预览标签`)
                for (var i = 0; i < 1; i++) {
                    console.log(`处理模板数据`)
                    let newBarCode = pageBarCode.clone()
                    if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                    for (var name in data[0]) {
                        if (name == 'barcode') {
                            let n = newBarCode[0].id.slice(newBarCode[0].id.length - 1, newBarCode[0].id.length)
                            JsBarcode("#BarCode" + n, data[0].barcode, {
                                format: 'CODE128',
                                height: $("#EditBarCodeHeight").val() || $("#BarCodeHeight").val() || 30,
                                width: $("#EditBarCodeWidth").val() || $("#BarCodeWidth").val() || 2,
                                font: 'Sans-serif'
                            })
                        }
                    }
                }
                // 第一层循环 => 处理所选数据数量
                for (var i = 0; i < 10; i++) {
                    console.log(`处理第${i + 1}条数据中~`)
                    // 拷贝模板元素 如果不存在 返回
                    let newBarCode = pageBarCode.clone()
                    if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                    // 第二层循环 => 找到每条数据中的条码值
                    for (var name in data[i]) {
                        if (name == 'smm') {
                            console.log(`第${i + 1}个一维码: ${data[i][name]}`)
                            // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                            for (var j = 0; j < data[i].dysl; j++) {
                                // 列数判断
                                if (status >= cv) {
                                    console.log('换行')
                                    status = 0
                                    spacing++
                                }
                                console.log(`该标签dysl为${data[i].dysl},正在循环生成第${j + 1}个`)
                                // 以模板元素各属性为基础进行复制
                                let BarCode = newBarCode.clone()
                                // Code
                                BarCode[0].id = BarCode[0].id.slice(0, BarCode[0].id.length - 1) + nums
                                // top
                                BarCode[0].style.top =
                                    Number(BarCode[0].style.top.slice(0, BarCode[0].style.top.length - 2)) +
                                    Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                                // left
                                BarCode[0].style.left =
                                    Number(BarCode[0].style.left.slice(0, BarCode[0].style.left.length - 2)) +
                                    Number(boxwidth * status) + Number(lrValue * status) + 'px'
                                // BarCode
                                BarCode[0].firstElementChild.id =
                                    BarCode[0].firstElementChild.id.slice(0, BarCode[0].firstElementChild.id.length - 1) + nums

                                $("#printmain").append(BarCode[0])
                                JsBarcode("#BarCode" + nums, data[i].smm, {
                                    format: 'CODE128',
                                    height: /* $("#EditBarCodeHeight").val() || $("#BarCodeHeight").val() || */ 30,
                                    width: /* $("#EditBarCodeWidth").val() || $("#BarCodeWidth").val() || */ 1,
                                    font: 'Sans-serif',
                                    fontSize: 14
                                })
                                console.log(`条码ID:${BarCode[0].id} 条码高度:${BarCode[0].style.top}`)
                                console.log(`间距倍数:${spacing}`)
                                console.log(`ID数值:${nums}`)
                                console.log(`列数：${status}`)
                                nums--
                                status++
                            }
                        }
                    }
                }
                console.timeEnd('creat-barcode🛴')
            }
            // 二维码批量生成
            function creatTmplQarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
                console.info('二维码打印🛬')
                // 计时器
                console.time('creat-qarcode🛴')
                let nums = 1000
                let spacing = 0
                let status = 1
                let cv = columnVal
                console.log(`生成10条预览标签`)
                for (var i = 0; i < 1; i++) {
                    console.log(`处理模板数据`)
                    let newQarCode = pageQarCode.clone()
                    if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                    for (var name in data[0]) {
                        if (name == 'qarcode') {
                            let n = newQarCode[0].id.slice(newQarCode[0].id.length - 1, newQarCode[0].id.length)
                            QRCode.toCanvas(document.getElementById("QarCode" + n), data[0].qarcode, {
                                margin: 1,
                                width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                            })
                        }
                    }
                }
                // 第一层循环 => 处理所选数据数量
                for (var i = 0; i < 10; i++) {
                    console.log(`处理第${i + 1}条数据中~`)
                    // 拷贝模板元素 如果不存在 返回
                    let newQarCode = pageQarCode.clone()
                    if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                    // 第二层循环 => 找到每条数据中的条码值
                    for (var name in data[i]) {
                        if (name == 'smm') {
                            console.log(`第${i + 1}个二维码: ${data[i][name]}`)
                            // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                            for (var j = 0; j < data[i].dysl; j++) {
                                // 列数判断
                                if (status >= cv) {
                                    console.log('换行')
                                    status = 0
                                    spacing++
                                }
                                console.log(`该标签dysl为${data[i].dysl},正在循环生成第${j + 1}个`)
                                // 以模板元素各属性为基础进行复制
                                let QarCode = newQarCode.clone()
                                // Code
                                QarCode[0].id = QarCode[0].id.slice(0, QarCode[0].id.length - 1) + nums
                                // top
                                QarCode[0].style.top =
                                    Number(QarCode[0].style.top.slice(0, QarCode[0].style.top.length - 2)) +
                                    Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                                // left
                                QarCode[0].style.left =
                                    Number(QarCode[0].style.left.slice(0, QarCode[0].style.left.length - 2)) +
                                    Number(boxwidth * status) + Number(lrValue * status) + 'px'
                                // BarCode
                                QarCode[0].firstElementChild.id =
                                    QarCode[0].firstElementChild.id.slice(0, QarCode[0].firstElementChild.id.length - 1) + nums

                                $("#printmain").append(QarCode[0])
                                QRCode.toCanvas(document.getElementById("QarCode" + nums), data[i].smm, {
                                    margin: 1,
                                    width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                                })
                                console.log(`条码ID:${QarCode[0].id}`)
                                console.log(`间距倍数:${spacing} 条码高度:${QarCode[0].style.top}`)
                                console.log(`列数：${status} 条码宽度:${QarCode[0].style.left}`)
                                console.log(`ID数值:${nums}`)
                                nums--
                                status++
                            }
                        }
                    }
                }
                console.timeEnd('creat-qarcode🛴')
            }
            // 文本批量生成
            function creatTmplText (columnVal, data, boxheight, boxwidth, textDataVal, lrValue, tbValue) {
                console.log('文本打印🛸')
                // 计时器
                console.time('creat-text🛴')
                // 处理模板数据
                let newText = pageText.clone()
                let nums = 1000
                let spacing = 0
                let status = 1
                let cv = columnVal
                console.log(`生成10条预览标签`)
                for (let i = 0; i < pageText.length; i++) {
                    console.log(`处理模板数据中~`)
                    pageText[i].firstChild.innerHTML = `${textDataVal[0][pageText[i].dataset.text]}`
                }
                // 第一层循环 => 处理所选数据
                for (var j = 0; j < 10; j++) {
                    console.log(`处理第${j + 1}条数据`)
                    // 第二层循环 => 根据文本框 dysl 值进行复制
                    for (var k = 0; k < data[j].dysl; k++) {
                        let num = j
                        console.log(`该数据dysl为${data[j].dysl},正在处理第${k + 1}条`)
                        // 第三层循环 => 根据模板文本框数量批量生成
                        for (var c = 0; c < newText.length; c++) {
                            let text = newText.clone()
                            if (status >= cv) {
                                console.log('换行')
                                status = 0
                                spacing++
                            }
                            // top
                            text[c].style.top =
                                Number(text[c].style.top.slice(0, text[c].style.top.length - 2)) +
                                Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                            // left
                            text[c].style.left =
                                Number(text[c].style.left.slice(0, text[c].style.left.length - 2)) +
                                Number(boxwidth * status) + Number(lrValue * status) + 'px'
                            // text
                            text[c].firstChild.innerHTML = `${textDataVal[j][text[c].dataset.text]}`;

                            text[c].firstChild.setAttribute('style', 'word-wrap:break-word;')
                            text[c].firstChild.setAttribute('style', `width:${boxwidth}px`)

                            $("#printmain").append(text[c])
                            console.log(`正在处理第${c}个文本,${textDataVal[num][newText[c].dataset.text]}`)
                            console.log(`间距倍数:${spacing} 文本框高度:${text[c].style.top}`)
                            console.log(`列数：${status} 文本框宽度:${text[c].style.left}`)
                            nums--
                        }
                        status++
                    }
                }
                console.timeEnd('creat-text🛴')
                $("#tableview").modal('hide')
            }
            // 线条批量生成
            function creatTmplLine (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
                console.log('线条批量生成🧭')
                // 计时器
                console.time('creat-line🛴')
                let newLine = pageLine.clone()
                let spacing = 0
                let status = 1
                let cv = columnVal
                if (newLine.length <= 0) return (console.warn('线条模板不存在'))
                console.log(`生成10条预览标签`)
                // 第一层循环 => 处理所选数据
                for (var i = 0; i < 10; i++) {
                    console.log(`处理第${i + 1}条数据`)
                    // 第二层循环 => 根据数据 dysl值进行复制
                    for (var j = 0; j < data[i].dysl; j++) {
                        console.log(`该数据dysl为${data[i].dysl},正在生成第${j}个`)
                        // 第三层 => 根据模板数据进行生成
                        for (var c = 0; c < newLine.length; c++) {
                            let line = newLine.clone()
                            if (status >= cv) {
                                console.log('换行')
                                status = 0
                                spacing++
                            }
                            // top
                            line[c].style.top =
                                Number(line[c].style.top.slice(0, line[c].style.top.length - 2)) +
                                Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                            // left
                            line[c].style.left =
                                Number(line[c].style.left.slice(0, line[c].style.left.length - 2)) +
                                Number(boxwidth * status) + Number(lrValue * status) + 'px'
                            $("#printmain").append(line[c])
                        }
                        status++
                    }
                }
                console.timeEnd('creat-line🛴')
            }
            // 边框批量生成
            function creatTmplBoxDiv (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
                console.log('边框批量生成🧭')
                // 计时器
                console.time('creat-box🛴')
                let newBox = pageBox.clone()
                let spacing = 0
                let status = 1
                let cv = columnVal
                if (newBox.length <= 0) return (console.warn('边框模板不存在'))
                console.log(`生成10条预览标签`)
                // 第一层循环 => 处理所选数据
                for (var i = 0; i < 10; i++) {
                    console.log(`处理第${i + 1}条数据`)
                    // 第二层循环 => 根据数据 dysl值进行复制
                    for (var j = 0; j < data[i].dysl; j++) {
                        console.log(`该数据dysl为${data[i].dysl},正在生成第${j}个`)
                        // 第三层 => 根据模板数据进行生成
                        for (var c = 0; c < newBox.length; c++) {
                            let line = newBox.clone()
                            if (status >= cv) {
                                console.log('换行')
                                status = 0
                                spacing++
                            }
                            // top
                            line[0].style.top =
                                Number(line[0].style.top.slice(0, line[0].style.top.length - 2)) +
                                Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                            // left
                            line[0].style.left =
                                Number(line[0].style.left.slice(0, line[0].style.left.length - 2)) +
                                Number(boxwidth * status) + Number(lrValue * status) + 'px'

                            $("#printmain").append(line[0])
                        }
                        status++
                    }
                }
                console.timeEnd('creat-box🛴')
            }
        }
    }

    // 模板打印
    Print.onclick = function () {
        console.time('print🚑')
        // 数据
        const chooseData = result.Table
        const tmpl = result.Table1
        const textDataVal = Object.values(chooseData)
        // 创建模板数据
        creatTmpl(tmpl)
        // 获取列值
        const cValue = $("#dataColumn").val()
        // 获取模板
        const pageText = $("#printmain").children("div .editable");
        const pageBarCode = $("#printmain").children("div .BarCodedbclick");
        const pageQarCode = $("#printmain").children("div .QarCodedbclick");
        const pageLine = $("#printmain").children("div .Line");
        const pageBox = $("#printmain").children("div .Box");
        // 获取模板框及宽度
        const firstBox = document.getElementById("demo");
        let height = firstBox.style.height;
        let width = firstBox.style.width
        let boxheight = height.slice(0, height.length - 2);
        let boxwidth = width.slice(0, width.length - 2)
        let c = $("#dataColumn").val()
        let lr = $("#dataLR").val()
        let tb = $("#dataTB").val()
        // 组件生成
        creatTmplBarCode(c, chooseData, boxheight, boxwidth, lr, tb)
        creatTmplQarCode(c, chooseData, boxheight, boxwidth, lr, tb)
        creatTmplText(c, chooseData, boxheight, boxwidth, textDataVal, lr, tb)
        creatTmplLine(c, chooseData, boxheight, boxwidth, lr, tb)
        creatTmplBoxDiv(c, chooseData, boxheight, boxwidth, lr, tb)
        Print()
        // 模板内容生成
        function creatTmpl (tmpl) {
            let x = $("#printmain").children()
            for (var i = 0; i < x.length; i++) {
                if (x[i].id !== 'demo') [
                    x[i].remove()
                ]
            }

            let data = JSON.parse(htmlDecode(tmpl[0].templatecontent))
            let a = data.code.split('</div>')
            let b = a.slice(0, a.length - 1).join('</div>')
            $("#printmain").append(b)
            for (let l = 0; l < data.allNum; l++) {
                if (document.getElementById('text' + l)) {
                    console.log('text++')
                }

                if (document.getElementById('BarCode' + l)) {
                    console.log('barcode++')
                    JsBarcode("#BarCode" + l, 'default', {
                        width: 1,
                        height: 10,
                        font: 'Sans-serif'
                    })
                }

                if (document.getElementById('QrCode' + l)) {
                    console.log('qarcode++')
                    QRCode.toCanvas(document.getElementById('QarCode' + l), 'default', {
                        margin: 1,
                        width: 64
                    })
                }

                if (document.getElementById('lineDiv' + l)) {
                    console.log('line++')
                }

                if (document.getElementById('boxDiv' + l)) {
                    console.log('box++')
                }
            }
        }
        // 一维码批量生成
        function creatTmplBarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
            console.info('一维码打印✈')
            // 计时器
            console.time('creat-barcode🛴')
            let nums = 1000
            let spacing = 0
            let status = 1
            let cv = columnVal
            console.log(`选择了${data.length}条数据`)
            for (var i = 0; i < 1; i++) {
                console.log(`处理模板数据`)
                let newBarCode = pageBarCode.clone()
                if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                for (var name in data[0]) {
                    if (name == 'barcode') {
                        let n = newBarCode[0].id.slice(newBarCode[0].id.length - 1, newBarCode[0].id.length)
                        JsBarcode("#BarCode" + n, data[0].barcode, {
                            format: 'CODE128',
                            height: $("#EditBarCodeHeight").val() || $("#BarCodeHeight").val() || 30,
                            width: $("#EditBarCodeWidth").val() || $("#BarCodeWidth").val() || 2,
                            font: 'Sans-serif'
                        })
                    }
                }
            }
            // 第一层循环 => 处理所选数据数量
            for (var i = 0; i < data.length; i++) {
                console.log(`处理第${i + 1}条数据中~`)
                // 拷贝模板元素 如果不存在 返回
                let newBarCode = pageBarCode.clone()
                if (newBarCode.length <= 0) return (console.log(`Error: 一维码模板不存在`))
                // 第二层循环 => 找到每条数据中的条码值
                for (var name in data[i]) {
                    if (name == 'smm') {
                        console.log(`第${i + 1}个一维码: ${data[i][name]}`)
                        // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                        for (var j = 0; j < data[i].dysl; j++) {
                            // 列数判断
                            if (status >= cv) {
                                console.log('换行')
                                status = 0
                                spacing++
                            }
                            console.log(`该标签dysl为${data[i].dysl},正在循环生成第${j + 1}个`)
                            // 以模板元素各属性为基础进行复制
                            let BarCode = newBarCode.clone()
                            // Code
                            BarCode[0].id = BarCode[0].id.slice(0, BarCode[0].id.length - 1) + nums
                            // top
                            BarCode[0].style.top =
                                Number(BarCode[0].style.top.slice(0, BarCode[0].style.top.length - 2)) +
                                Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                            // left
                            BarCode[0].style.left =
                                Number(BarCode[0].style.left.slice(0, BarCode[0].style.left.length - 2)) +
                                Number(boxwidth * status) + Number(lrValue * status) + 'px'
                            // BarCode
                            BarCode[0].firstElementChild.id =
                                BarCode[0].firstElementChild.id.slice(0, BarCode[0].firstElementChild.id.length - 1) + nums

                            $("#printmain").append(BarCode[0])
                            JsBarcode("#BarCode" + nums, data[i].smm, {
                                format: 'CODE128',
                                height: /* $("#EditBarCodeHeight").val() || $("#BarCodeHeight").val() || */ 30,
                                width: /* $("#EditBarCodeWidth").val() || $("#BarCodeWidth").val() || */ 1,
                                font: 'Sans-serif',
                                fontSize: 14
                            })
                            console.log(`条码ID:${BarCode[0].id} 条码高度:${BarCode[0].style.top}`)
                            console.log(`间距倍数:${spacing}`)
                            console.log(`ID数值:${nums}`)
                            console.log(`列数：${status}`)
                            nums--
                            status++
                        }
                    }
                }
            }
            console.timeEnd('creat-barcode🛴')
        }
        // 二维码批量生成
        function creatTmplQarCode (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
            console.info('二维码打印🛬')
            // 计时器
            console.time('creat-qarcode🛴')
            let nums = 1000
            let spacing = 0
            let status = 1
            let cv = columnVal
            console.log(`选择了${data.length}条数据`)
            for (var i = 0; i < 1; i++) {
                console.log(`处理模板数据`)
                let newQarCode = pageQarCode.clone()
                if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                for (var name in data[0]) {
                    if (name == 'qarcode') {
                        let n = newQarCode[0].id.slice(newQarCode[0].id.length - 1, newQarCode[0].id.length)
                        QRCode.toCanvas(document.getElementById("QarCode" + n), data[0].qarcode, {
                            margin: 1,
                            width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                        })
                    }
                }
            }
            // 第一层循环 => 处理所选数据数量
            for (var i = 0; i < data.length; i++) {
                console.log(`处理第${i + 1}条数据中~`)
                // 拷贝模板元素 如果不存在 返回
                let newQarCode = pageQarCode.clone()
                if (newQarCode.length <= 0) return (console.log(`Error: 二维码模板不存在`))
                // 第二层循环 => 找到每条数据中的条码值
                for (var name in data[i]) {
                    if (name == 'smm') {
                        console.log(`第${i + 1}个二维码: ${data[i][name]}`)
                        // 第三层循环 => 检测每条数据中的 dysl值并批量复制
                        for (var j = 0; j < data[i].dysl; j++) {
                            // 列数判断
                            if (status >= cv) {
                                console.log('换行')
                                status = 0
                                spacing++
                            }
                            console.log(`该标签dysl为${data[i].dysl},正在循环生成第${j + 1}个`)
                            // 以模板元素各属性为基础进行复制
                            let QarCode = newQarCode.clone()
                            // Code
                            QarCode[0].id = QarCode[0].id.slice(0, QarCode[0].id.length - 1) + nums
                            // top
                            QarCode[0].style.top =
                                Number(QarCode[0].style.top.slice(0, QarCode[0].style.top.length - 2)) +
                                Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                            // left
                            QarCode[0].style.left =
                                Number(QarCode[0].style.left.slice(0, QarCode[0].style.left.length - 2)) +
                                Number(boxwidth * status) + Number(lrValue * status) + 'px'
                            // BarCode
                            QarCode[0].firstElementChild.id =
                                QarCode[0].firstElementChild.id.slice(0, QarCode[0].firstElementChild.id.length - 1) + nums

                            $("#printmain").append(QarCode[0])
                            QRCode.toCanvas(document.getElementById("QarCode" + nums), data[i].smm, {
                                margin: 1,
                                width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64
                            })
                            console.log(`条码ID:${QarCode[0].id}`)
                            console.log(`间距倍数:${spacing} 条码高度:${QarCode[0].style.top}`)
                            console.log(`列数：${status} 条码宽度:${QarCode[0].style.left}`)
                            console.log(`ID数值:${nums}`)
                            nums--
                            status++
                        }
                    }
                }
            }
            console.timeEnd('creat-qarcode🛴')
        }
        // 文本批量生成
        function creatTmplText (columnVal, data, boxheight, boxwidth, textDataVal, lrValue, tbValue) {
            console.log('文本打印🛸')
            // 计时器
            console.time('creat-text🛴')
            // 处理模板数据
            let newText = pageText.clone()
            let nums = 1000
            let spacing = 0
            let status = 1
            let cv = columnVal
            console.log(`选择了${data.length}条数据`)
            for (let i = 0; i < pageText.length; i++) {
                console.log(`处理模板数据中~`)
                pageText[i].firstChild.innerHTML = `${textDataVal[0][pageText[i].dataset.text]}`
            }
            // 第一层循环 => 处理所选数据
            for (var j = 0; j < data.length; j++) {
                console.log(`处理第${j + 1}条数据`)
                // 第二层循环 => 根据文本框 dysl 值进行复制
                for (var k = 0; k < data[j].dysl; k++) {
                    let num = j
                    console.log(`该数据dysl为${data[j].dysl},正在处理第${k + 1}条`)
                    // 第三层循环 => 根据模板文本框数量批量生成
                    for (var c = 0; c < newText.length; c++) {
                        let text = newText.clone()
                        if (status >= cv) {
                            console.log('换行')
                            status = 0
                            spacing++
                        }
                        // top
                        text[c].style.top =
                            Number(text[c].style.top.slice(0, text[c].style.top.length - 2)) +
                            Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                        // left
                        text[c].style.left =
                            Number(text[c].style.left.slice(0, text[c].style.left.length - 2)) +
                            Number(boxwidth * status) + Number(lrValue * status) + 'px'
                        // text
                        text[c].firstChild.innerHTML = `${textDataVal[j][text[c].dataset.text]}`;

                        text[c].firstChild.setAttribute('style', 'word-wrap:break-word;')
                        text[c].firstChild.setAttribute('style', `width:${boxwidth}px`)

                        $("#printmain").append(text[c])
                        console.log(`正在处理第${c}个文本,${textDataVal[num][newText[c].dataset.text]}`)
                        console.log(`间距倍数:${spacing} 文本框高度:${text[c].style.top}`)
                        console.log(`列数：${status} 文本框宽度:${text[c].style.left}`)
                        nums--
                    }
                    status++
                }
            }
            console.timeEnd('creat-text🛴')
            $("#tableview").modal('hide')
        }
        // 线条批量生成
        function creatTmplLine (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
            console.log('线条批量生成🧭')
            // 计时器
            console.time('creat-line🛴')
            let newLine = pageLine.clone()
            let spacing = 0
            let status = 1
            let cv = columnVal
            if (newLine.length <= 0) return (console.warn('线条模板不存在'))
            console.log(`选择了${data.length}条数据`)
            // 第一层循环 => 处理所选数据
            for (var i = 0; i < data.length; i++) {
                console.log(`处理第${i + 1}条数据`)
                // 第二层循环 => 根据数据 dysl值进行复制
                for (var j = 0; j < data[i].dysl; j++) {
                    console.log(`该数据dysl为${data[i].dysl},正在生成第${j}个`)
                    // 第三层 => 根据模板数据进行生成
                    for (var c = 0; c < newLine.length; c++) {
                        let line = newLine.clone()
                        if (status >= cv) {
                            console.log('换行')
                            status = 0
                            spacing++
                        }
                        // top
                        line[c].style.top =
                            Number(line[c].style.top.slice(0, line[c].style.top.length - 2)) +
                            Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                        // left
                        line[c].style.left =
                            Number(line[c].style.left.slice(0, line[c].style.left.length - 2)) +
                            Number(boxwidth * status) + Number(lrValue * status) + 'px'
                        $("#printmain").append(line[c])
                    }
                    status++
                }
            }
            console.timeEnd('creat-line🛴')
        }
        // 边框批量生成
        function creatTmplBoxDiv (columnVal, data, boxheight, boxwidth, lrValue, tbValue) {
            console.log('边框批量生成🧭')
            // 计时器
            console.time('creat-box🛴')
            let newBox = pageBox.clone()
            let spacing = 0
            let status = 1
            let cv = columnVal
            if (newBox.length <= 0) return (console.warn('边框模板不存在'))
            console.log(`选择了${data.length}条数据`)
            // 第一层循环 => 处理所选数据
            for (var i = 0; i < data.length; i++) {
                console.log(`处理第${i + 1}条数据`)
                // 第二层循环 => 根据数据 dysl值进行复制
                for (var j = 0; j < data[i].dysl; j++) {
                    console.log(`该数据dysl为${data[i].dysl},正在生成第${j}个`)
                    // 第三层 => 根据模板数据进行生成
                    for (var c = 0; c < newBox.length; c++) {
                        let line = newBox.clone()
                        if (status >= cv) {
                            console.log('换行')
                            status = 0
                            spacing++
                        }
                        // top
                        line[0].style.top =
                            Number(line[0].style.top.slice(0, line[0].style.top.length - 2)) +
                            Number(boxheight * spacing) + Number(tbValue * spacing) + 'px'
                        // left
                        line[0].style.left =
                            Number(line[0].style.left.slice(0, line[0].style.left.length - 2)) +
                            Number(boxwidth * status) + Number(lrValue * status) + 'px'

                        $("#printmain").append(line[0])
                    }
                    status++
                }
            }
            console.timeEnd('creat-box🛴')
        }
        // 打印
        function Print () {
            // 修改 pisition值避免出现打印内容重复
            $("#printmain").children().css('position', 'absolute')
            // printJs 插件打印
            printJS({
                printable: "printmain",
                type: "html",
                css: '/css/print.css',
                scanStyles: false
            });
            // 改回原值避免打印元素整体错位
            $("#printmain").children().css('position', 'fixed')
        }
        $("#printmodal").modal('hide')
        console.timeEnd('print🚑')

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
            url: 'http://test.ecsun.cn:99/mzato/main/labels/set',
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
                    url: 'http://test.ecsun.cn:99/mzato/main/labels/set',
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
                let x = $("#printmain").children()
                for (var i = 0; i < x.length; i++) {
                    if (x[i].id !== 'demo') [
                        x[i].remove()
                    ]
                }

                let a = data.code.split('</div>')
                let b = a.slice(0, a.length - 1).join('</div>')
                $("#printmain").append(b)
                for (let l = 0; l < data.allNum; l++) {
                    if (document.getElementById('text' + l)) {
                        console.log('text++')
                        drag(document.getElementById('text' + l), { minSize: 30 })
                    }

                    if (document.getElementById('BarCode' + l)) {
                        console.log('barcode++')
                        JsBarcode("#BarCode" + l, 'default', {
                            width: 1,
                            height: 10,
                            font: 'Sans-serif'
                        })
                        drag(document.getElementById('Code' + l), { minSize: 30 })
                    }

                    if (document.getElementById('QrCode' + l)) {
                        console.log('qarcode++')
                        QRCode.toCanvas(document.getElementById('QarCode' + l), 'default', {
                            margin: 1,
                            width: 64
                        })
                        drag(document.getElementById('QrCode' + l), { minSize: 30 })
                    }

                    if (document.getElementById('lineDiv' + l)) {
                        console.log('line++')
                        drag(document.getElementById('lineDiv' + l), { minSize: 30 })
                    }

                    if (document.getElementById('boxDiv' + l)) {
                        console.log('box++')
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
