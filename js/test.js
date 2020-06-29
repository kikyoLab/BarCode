"use strict";

const $table = $("#table");
const $button = $("#button");
const $multPrint = $("#multPrint")
const allData = (function () {
    let result;
    $.ajax({
        type: "get",
        url: "index.json",
        dataType: "json",
        data: "",
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;
})();

// bootstrap-table设置
(function () {
    for (var name in allData.data[0]) {
        if (name !== 'id' && name !== 'barcode' && name !== 'qarcode') {
            $("#databind").append(`<option>${name}</option>`)
        }
    }

    $('#tableview').on('shown.bs.modal', function () {
        $table.bootstrapTable('resetView')
    })

    $table.bootstrapTable({ data: allData.data });

    const pullData = document.getElementById("pull");
    pullData.onclick = function () {
        $("#tableview").modal({
            backdrop: 'static'
        });
    };
})()


/**
 * 拖拽事件
 * @param {object} ele - 拖拽对象
 * @param {object} config - 设置拖拽框大小，比如 { minSize: 30 }
 */

function drag (ele, config = {}) {
    const eleRemove = document.getElementById("remove")
    let removeDragger;
    // 单击事件 
    ele.addEventListener("click", () => {
        if (!removeDragger) {
            const { removeAllControler, eles } = injectController(ele, config);
            removeDragger = removeAllControler;
            const handleRemove = ({ target }) => {
                if (![...eles, ele].includes(target)) {
                    removeDragger && removeDragger();
                    removeDragger = undefined;
                    document.removeEventListener("mouseup", handleRemove);
                }
            };
            document.addEventListener("mouseup", handleRemove);
        }
        eleRemove.onclick = function () {
            let eleid = ele.id
            $("#" + eleid).remove()
            console.log(`${ele.id} is remove `)
        }
    });

    // 双击事件 
    ele.addEventListener("dblclick", () => {
        console.log(ele.id + ' dbclick event')
        if (ele.className == "editable refbox") {
            // 文本框事件 
            eleId = ele.id;
            $("#exampleModalCenter").modal({
                backdrop: 'static'
            })
            // 文本赋值
            um.setContent(
                $("#" + ele.id)
                    .children()
                    .html()
            );
        } else if (ele.className == "BarCodedbclick refbox") {
            // 一维码事件 
            ele.addEventListener("dblclick", () => {
                // 从session中获取该一维码原始值
                let a = JSON.parse(sessionStorage.getItem(ele.id));
                $("#EditbarcodeformModalCenter").modal({
                    backdrop: 'static'
                });
                JsBarcode("#EditBarCodeView", a.data, {
                    format: a.format,
                    height: a.height,
                    width: a.width,
                    font: 'Sans-serif',
                });
                // 把原始值展示表单
                $("#EditBarCodeID").val(a.data);
                $("#EditBarCodeType").val(a.format);
                $("#EditBarCodeHeight").val(a.height);
                $("#EditBarCodeWidth").val(a.width);
            });
            // 将表单值赋给一维码
            const EditBarCodeFromOk = document.getElementById("EditBarCodeFormok");
            EditBarCodeFromOk.onclick = function () {
                JsBarcode("#Bar" + ele.id, $("#EditBarCodeID").val(), {
                    format: $("#EditBarCodeType").val(),
                    height: $("#EditBarCodeHeight").val(),
                    width: $("#EditBarCodeWidth").val(),
                    font: 'Sans-serif',
                });
                // 更新值
                const editcodeval = {
                    id: ele.id,
                    data: $("#EditBarCodeID").val(),
                    format: $("#EditBarCodeType").val(),
                    height: $("#EditBarCodeHeight").val(),
                    width: $("#EditBarCodeWidth").val(),
                };
                sessionStorage.setItem(ele.id, JSON.stringify(editcodeval));
                $("#EditbarcodeformModalCenter").modal("hide");
            };
        } else if (ele.className == "QarCodedbclick refbox") {
            // 二维码事件
            ele.addEventListener("dblclick", () => {
                // 获取二维码原始值
                let b = JSON.parse(sessionStorage.getItem(ele.id));
                $("#EditqarcodeformModalCenter").modal({
                    backdrop: 'static'
                });
                QRCode.toCanvas(document.getElementById("EditQarCodeView"), b.data);
                // 把原始值展示在表单
                $("#EditQarCodeID").val(b.data);
                $("#EditQarCodeWidth").val(b.width)
            });

            // 把表单值赋给二维码
            const EditQarCodeFromOk = document.getElementById("EditQarCodeFormok");
            EditQarCodeFromOk.onclick = function () {
                let qrid = ele.id;
                let num = qrid.split('').slice(6, qrid.length).join('')
                QRCode.toCanvas(document.getElementById("QarCode" + num),
                    $("#EditQarCodeID").val(), {
                    width: $("#EditQarCodeWidth").val()
                });

                // 更新值
                const editqarcodeval = {
                    id: ele.id,
                    data: $("#EditQarCodeID").val(),
                };

                sessionStorage.setItem(ele.id, JSON.stringify(editqarcodeval));
                $("#EditqarcodeformModalCenter").modal("hide");
            };
        }
    }, false);

    function injectController (ele, config) {
        /* 获取初始位置 */
        const { x, y, width, height } = ele.getBoundingClientRect();
        const bodyMargin = getPxNumber(getComputedStyle(document.body).margin);
        /* 控件容器 */
        const controlWrapper = document.createElement("div");
        /* 设置目标元素和容器样式 */
        const _style_ = new Proxy(controlWrapper.style, {
            get (o, key) {
                /* get controlWrapper.style.xxx的xxx样式值 */
                let originalStyleValue = Reflect.get(o, key);
                /* 修改 key */
                if (["width", "height", "left", "top"].includes(key) && !originalStyleValue) {
                    originalStyleValue = controlWrapper.getBoundingClientRect()[key];
                }
                return originalStyleValue;
            },
            set (o, key, val) {
                const pxNumber = getPxNumber(val);
                /* 目标元素style */
                if (["left", "top"].includes(key)) {
                    ele.style[key] = `${pxNumber - bodyMargin}px`;
                } else if (["width", "height"].includes(key)) {
                    ele.style[key] = val;
                }
                Reflect.set(o, key, val);
                return val;
            },
        });
        /* 控件初始样式 */
        Object.assign(controlWrapper.style, {
            position: "fixed",
            width: `${width}px`,
            height: `${height}px`,
            top: `${y}px`,
            left: `${x}px`,
            /* 拖拽移动 */
            cursor: "all-scroll",
            border: "1px dashed #000",
        });
        controlWrapper._style_ = _style_;
        const { removeControler, eles } = createControler(
            controlWrapper,
            {
                width,
                height,
            },
            config
        );
        ele.appendChild(controlWrapper);
        return {
            removeAllControler () {
                removeControler();
                ele.removeChild(controlWrapper);
            },
            eles: [...eles, controlWrapper],
        };
    }

    function getPxNumber (str) {
        return parseFloat(str, 10);
    }

    function createControler (ele, { x, y, width, height }, { minSize = 10 }) {
        const { eles } = renderCorner({ x, y, width, height });
        const [tl, tr, bl, br] = eles;
        const handleControlerMouseDown = handleMouseDown(
            (target, detaX, detaY, isMoveTargetElement) => {
                /* 左边两个角 */
                const isLeft = [tl, bl].includes(target);
                /* 上面两个角 */
                const isTop = [tl, tr].includes(target);
                const directionLeft = !isLeft ? 1 : -1;
                const directionTop = !isTop ? 1 : -1;
                /* 新的宽高 */
                let newWidth = getPxNumber(ele._style_.width) + directionLeft * detaX;
                let newHeight = getPxNumber(ele._style_.height) + directionTop * detaY;
                /* 拖拽整个元素时 */
                if (isMoveTargetElement) {
                    const newL = getPxNumber(ele._style_.left);
                    const newT = getPxNumber(ele._style_.top);

                    if (`${newL + detaX}` <= 30) {
                        ele._style_.left = `${30}px`
                    } else if (`${newL + detaX}` >= 800) {
                        ele._style_.left = `${800}px`
                    } else {
                        ele._style_.left = `${newL + detaX}px`;
                    }

                    if (`${newT + detaY}` <= 117) {
                        ele._style_.top = `${117}px`
                    } else if (`${newT + detaY}` >= 600) {
                        ele._style_.top = `${600}px`
                    } else {
                        ele._style_.top = `${newT + detaY}px`;
                    }
                    return;
                }

                newWidth = newWidth < minSize ? minSize : newWidth;
                newHeight = newHeight < minSize ? minSize : newHeight;
                /* 拖动四个角 */
                ele._style_.width = `${newWidth}px`;
                ele._style_.height = `${newHeight}px`;
                ele._style_.left = isLeft ? `${getPxNumber(ele._style_.left) - directionLeft * detaX}px` : ele._style_.left;
                ele._style_.top = isTop ? `${getPxNumber(ele._style_.top) - directionTop * detaY}px` : ele._style_.top;
            },
            (target, handleMove) => {
                const handleMoveTargetElement = (e) => handleMove(e, true);
                /* 四个角和整个元素的处理 */
                /* 四个角改变宽高 */
                if (eles.includes(target)) {
                    document.addEventListener("mousemove", handleMove);
                } else {
                    /* 整个元素改变位置 */
                    document.addEventListener("mousemove", handleMoveTargetElement);
                }
                document.addEventListener("mouseup", ({ target }) => {
                    document.removeEventListener("mousemove", handleMove);
                    document.removeEventListener("mousemove", handleMoveTargetElement);
                });
            }
        );
        document.addEventListener("mousedown", handleControlerMouseDown);
        eles.forEach((e) => {
            ele.appendChild(e);
        });
        return {
            removeControler () {
                eles.forEach((e) => {
                    ele.removeChild(e);
                });
                document.removeEventListener("mousedown", handleControlerMouseDown);
            },
            eles: [...eles, ele],
        };
    }

    function handleMouseDown (onMove, bindUpAndDown) {
        return function ({ target, clientX: x, clientY: y }) {
            let x0 = x;
            let y0 = y;
            function handleMove (e, ...rest) {
                const { clientX, clientY } = e;
                e.preventDefault();
                const detaX = clientX - x0;
                const detaY = clientY - y0;
                x0 = clientX;
                y0 = clientY;
                onMove(target, detaX, detaY, ...rest);
            }
            bindUpAndDown(target, handleMove);
        };
    }

    function renderCorner ({ width, height }) {
        const eles = Array.from({ length: 4 }).map(() =>
            document.createElement("div")
        );
        eles.forEach((x) => x.classList.add("controller-corner"));
        const [tl, tr, bl, br] = eles;
        Object.assign(tl.style, {
            top: `-5px`,
            left: `-5px`,
            cursor: "nw-resize",
        });
        Object.assign(tr.style, {
            top: `-5px`,
            cursor: "ne-resize",
            right: `-5px`,
        });
        Object.assign(bl.style, {
            bottom: `-5px`,
            cursor: "sw-resize",
            left: `-5px`,
        });
        Object.assign(br.style, {
            bottom: `-5px`,
            cursor: "se-resize",
            right: `-5px`,
        });
        return { eles };
    }
}

/**
 * 拉取数据批量生成标签
 * @param {object} chooseData 已选数据
 * @param {Array} dataList 已选数据每项 id
 * @param {Array} dataValueList 已选数据每项 id 和 value
 */

// 获取模板框条码值
let chooseBdata
let chooseQdata

$(function () {
    $multPrint.click(function () {
        // 耗时计算
        console.time("print");

        // 获取已选项
        const chooseData = $table.bootstrapTable("getSelections")

        // 提取数据
        const dataList = chooseData.map(x =>
            Object.keys(x).filter(y => y !== 'id' && y !== 'barcode' && y !== 'qarcode' && y !== 'state'))

        const pageText = $("#printmain").children("div .editable");
        const pageBarCode = $("#printmain").children("div .BarCodedbclick");
        const pageQarCode = $("#printmain").children("div .QarCodedbclick");
        const pageLine = $("#printmain").children("div .Line");
        const pageBox = $("#printmain").children("div .Box");

        // 获取模板框及宽度
        const dataValueList = Object.values(chooseData)
        const firstBox = document.getElementById("demo");
        let height = firstBox.style.height;
        let boxheight = height.slice(0, height.length - 2);
        let nums = 200

        // 模板框数据生成
        for (var i = 0; i < 1; i++) {
            console.log(`第${i}个模板`)

            // 获取模板框内对应条码
            let newBarCode = pageBarCode.clone()
            let newQarCode = pageQarCode.clone()

            // 赋值
            for (var name in chooseData[0]) {
                if (name == 'barcode') {
                    console.log(`第${i}个一维码:${chooseData[0][name]}`)
                    if (newBarCode.length > 0) {
                        let n = newBarCode[0].id.slice(newBarCode[0].id.length - 1, newBarCode[0].id.length)
                        chooseBdata = chooseData[0][name]
                        JsBarcode("#BarCode" + n, chooseData[0][name], {
                            format: 'CODE128',
                            height: $("#EditBarCodeHeight").val() || $("#BarCodeHeight").val() || 30,
                            width: $("#EditBarCodeWidth").val() || $("#BarCodeWidth").val() || 2,
                            font: 'Sans-serif',
                        });
                    }
                }

                if (name == 'qarcode') {
                    if (newQarCode.length > 0) {
                        console.log(`第${i}个二维码:${chooseData[0][name]}`)
                        chooseQdata = chooseData[0][name]
                        let n = newQarCode[0].id.slice(newQarCode[0].id.length - 1, newQarCode[0].id.length)
                        QRCode.toCanvas(document.getElementById("QarCode" + n), chooseData[0][name], {
                            margin: 1,
                            width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64,
                        });
                    }
                }
            }
        }

        // 根据模板框批量生成
        for (var i = 1; i < chooseData.length; i++) {
            console.log(`第${i}个模板`)
            let newBarCode = pageBarCode.clone()
            let newQarCode = pageQarCode.clone()
            for (var name in chooseData[i]) {
                if (name == 'barcode') {
                    if (newBarCode.length > 0) {
                        console.log(`第${i}个一维码:${chooseData[i][name]}`)
                        newBarCode[0].id = newBarCode[0].id.slice(0, newBarCode[0].id.length - 1) +
                            nums

                        newBarCode[0].style.top =
                            Number(newBarCode[0].style.top.slice(0, newBarCode[0].style.top.length - 2)) +
                            Number(boxheight * i) + "px"

                        newBarCode[0].firstElementChild.id =
                            newBarCode[0].firstElementChild.id.slice(0, newBarCode[0].firstElementChild.id.length - 1) + nums

                        $("#printmain").append(newBarCode[0]);
                        $("#printmain").css({ "height": `${newBarCode[0].style.top}` })

                        // 修改值 ? 修改值:原始值 ? 原始值:默认值
                        JsBarcode("#BarCode" + nums, chooseData[i][name], {
                            format: 'CODE128',
                            height: $("#EditBarCodeHeight").val() || $("#BarCodeHeight").val() || 30,
                            width: $("#EditBarCodeWidth").val() || $("#BarCodeWidth").val() || 2,
                            font: 'Sans-serif',
                        });
                    }
                }

                if (name == 'qarcode') {
                    if (newQarCode.length > 0) {
                        console.log(`第${i}个二维码:${chooseData[i][name]}`)
                        newQarCode[0].id = newQarCode[0].id.slice(0, newQarCode[0].id.length - 1) + nums

                        newQarCode[0].style.top =
                            Number(newQarCode[0].style.top.slice(0, newQarCode[0].style.top.length - 2)) +
                            Number(boxheight * i) + "px"

                        newQarCode[0].firstElementChild.id =
                            newQarCode[0].firstElementChild.id.slice(0, newQarCode[0].firstElementChild.id.length - 1) + nums

                        $("#printmain").append(newQarCode[0]);

                        // 修改值 ? 修改值:原始值 ? 原始值:默认值
                        QRCode.toCanvas(document.getElementById("QarCode" + nums), chooseData[i][name], {
                            margin: 1,
                            width: $("#EditQarCodeWidth").val() || $("#QarCodeWidth").val() || 64,
                        });
                    }
                }
            }
            nums--
        }

        for (var i = 0; i < pageText.length; i++) {
            pageText[i].firstChild.innerHTML = `${dataValueList[0][pageText[i].dataset.text]}`
            console.log(`第0个文本框 => ${pageText[i].dataset.text}:${dataValueList[0][pageText[i].dataset.text]}`)
        }

        // 文本批量生成
        for (var i = 1; i < dataList.length; i++) {
            let newText = pageText.clone()
            for (var j = 0; j < newText.length; j++) {
                let pullDataValue = dataValueList[i]
                newText[j].style.top =
                    Number(newText[j].style.top.slice(0, newText[j].style.top.length - 2)) +
                    Number(boxheight * i) + "px"

                $("#printmain").append(newText[j])
                $("#printmain").css({ "height": `${newText[j].style.top}` })
                newText[j].firstChild.innerHTML = `${pullDataValue[newText[j].dataset.text]}`;
                console.log(`第${i}个文本框 => ${newText[j].dataset.text}:${pullDataValue[newText[j].dataset.text]}`)
            }
        }

        for (var i = 1; i < chooseData.length; i++) {
            console.log(`第${i}个模板`)
            // 边框批量生成
            for (var j = 0; j < pageBox.length; j++) {
                let newBox = pageBox.clone()

                newBox[j].style.top =
                    Number(newBox[j].style.top.slice(0, newBox[j].style.top.length - 2)) +
                    Number(boxheight * i) + "px"

                $("#printmain").append(newBox[j])
                console.log(`第${i}个边框`)
            }

            // 线条批量生成
            for (var l = 0; l < pageLine.length; l++) {
                let newLine = pageLine.clone()

                newLine[l].style.top =
                    Number(newLine[l].style.top.slice(0, newLine[l].style.top.length - 2)) +
                    Number(boxheight * i) + "px"

                $("#printmain").append(newLine[l])
                console.log(`第${i}个线条`)
            }
        }
        $("#tableview").modal('hide')
        console.log('生成完毕')
        // 耗时计算
        console.timeEnd("print");
    })

})

/**
 * 一维码事件
 * @param {number} j 一维码ID
 */

const BarCodeFormModel = document.getElementById("BarCodeFormModel");
const BarCodeFormOk = document.getElementById("BarCodeFormok");
let j = 0;

// 一维码原始生成
BarCodeFormModel.onclick = function () {
    $("#barcodeformModalCenter").modal({
        backdrop: 'static'
    });

    // 一维码修改预览
    JsBarcode("#BarCodeView", "data", {
        format: "CODE128",
        height: parseInt($("#BarCodeHeight").val()),
        width: $("#BarCodeWidth").val(),
    });

    /*     // 使用商品ID获取条码值
        const testbtn = document.getElementById("loadBarCodeID");
        testbtn.onclick = function () {
            var resid = $("#BarCodeProductID").val();
            for (var i = 0; i < allData.data.length; i++) {
                if (allData.data[i].id == resid) {
                    $("#BarCodeID").val(allData.data[i].barcode);
                    console.log('BarCode is pulling:' + allData.data[i].barcode)
                }
            }
        } */
};

// 确定生成
BarCodeFormOk.onclick = function () {
    $("#printmain").append(
        `<div id=${"Code" + j} style="position: fixed; margin: 0; overflow: hidden;z-index:2" class="BarCodedbclick refbox">
		<svg id=${"BarCode" + j}></svg>
		</div>`
    );

    JsBarcode("#BarCode" + j, $("#BarCodeID").val(), {
        format: $("#BarCodeType").val(),
        height: $("#BarCodeHeight").val(),
        width: $("#BarCodeWidth").val(),
        font: 'Sans-serif',
    });
    // 加上拖拽事件并初始化
    drag(document.getElementById("Code" + j), { minSize: 52 });
    $("#BarCode" + j).click()

    // 将值存入session
    $("#barcodeformModalCenter").modal("hide");
    const codeval = {
        id: "Code" + j,
        data: $("#BarCodeID").val(),
        format: $("#BarCodeType").val(),
        height: $("#BarCodeHeight").val(),
        width: $("#BarCodeWidth").val(),
    };
    sessionStorage.setItem("Code" + j, JSON.stringify(codeval));
    j++;
    allNum++;
};

// 动态监听一维码表单变动并更新一维码预览图像
$("#BarCodeForm").change(function () {
    JsBarcode("#BarCodeView", $("#BarCodeID").val(), {
        format: $("#BarCodeType").val(),
        height: $("#BarCodeHeight").val(),
        width: $("#BarCodeWidth").val(),
        font: 'Sans-serif',
        valid: (valid) => {
            if (!valid) {
                $("#BarCodeError").html("Error: 条码ID与类型不符");
                setTimeout(function () {
                    $("#BarCodeError").html("");
                }, 2000);
            }
        },
    });
});

/* // 一维码修改事件 使用ID获取条码值
$("#EditloadBarCodeID").click(function () {
    var resid = $("#EditBarCodeProductID").val();
    for (var i = 0; i < allData.data.length; i++) {
        if (allData.data[i].id == resid) {
            $("#EditBarCodeID").val(allData.data[i].barcode);
            console.log('EditBarCode is pulling:' + allData.data[i].barcode)
        }
    }
}); */

// 动态监听一维码修改表单变动并更新一维码预览图像
$("#EditBarCodeForm").change(function () {
    JsBarcode("#EditBarCodeView", $("#EditBarCodeID").val(), {
        format: $("#EditBarCodeType").val(),
        height: $("#EditBarCodeHeight").val(),
        width: $("#EditBarCodeWidth").val(),
        font: 'Sans-serif',
        valid: (valid) => {
            if (valid == false) {
                $("#EditBarCodeError").html("条码ID与类型不符!!!");
                setTimeout(function () {
                    $("#EditBarCodeError").html("");
                }, 2000);
            }
        },
    });
});

/**
 * 二维码表单事件
 * @param {number} k 二维码ID
 */
const QarCodeFormModel = document.getElementById("QarCodeFormModel");
const QarCodeFormok = document.getElementById("QarCodeFormok");
let k = 0;
QarCodeFormModel.onclick = function () {
    $("#qarcodeformModalCenter").modal({
        backdrop: 'static'
    });

    // 二维码预览
    QRCode.toCanvas(document.getElementById("QarCodeView"), "data", {
        errorCorrectionLevel: "H",
    });
};

/* // 原始表单使用商品ID获取条码值
$("#loadQarCodeID").click(function () {
    let resid = $("#QarCodeProductID").val();
    for (let i = 0; i < allData.data.length; i++) {
        if (allData.data[i].id == resid) {
            $("#QarCodeID").val(allData.data[i].qarcode);
            console.log('QarCodeId pulling:' + allData.data[i].qarcode)
        }
    }
});

// 修改表单使用商品ID获取条码值
$("#EditloadQarCodeID").click(function () {
    let resid = $("#EditQarCodeProductID").val();
    for (let i = 0; i < allData.data.length; i++) {
        if (allData.data[i].id == resid) {
            $("#EditQarCodeID").val(allData.data[i].qarcode);
            console.log('EditQarCodeId pulling:' + allData.data[i].qarcode)
        }
    }
}); */

// 二维码生成
QarCodeFormok.onclick = function () {
    $("#printmain").append(`<div id=${
        "QrCode" + k} style="position: fixed; margin: 0; overflow: hidden;z-index:2" class="QarCodedbclick refbox">
		<canvas id=${"QarCode" + k}></canvas></div>`
    );

    QRCode.toCanvas(document.getElementById("QarCode" + k), $("#QarCodeID").val(), {
        margin: 1,
        width: $("#QarCodeWidth").val(),
    });

    // 加入拖拽事件并初始化
    drag(document.getElementById("QrCode" + k), { minSize: 30 });
    $("#QarCode" + k).click()

    $("#qarcodeformModalCenter").modal("hide");
    const qrcodeval = {
        id: "QrCode" + k,
        data: $("#QarCodeID").val(),
        width: $("#QarCodeWidth").val()
    };

    // 将值存入session
    sessionStorage.setItem("QrCode" + j, JSON.stringify(qrcodeval));
    k++;
    allNum++;
};

// 动态监听原始表单变动并更新二维码预览
$("#QarCodeForm").change(function () {
    QRCode.toCanvas(
        document.getElementById("QarCodeView"),
        $("#QarCodeID").val(), {
        errorCorrectionLevel: "H",
        margin: 1,
        width: $("#QarCodeWidth").val(),
    });
});

// 动态监听修改表单变动并更新二维码预览
$("#EditQarCodeForm").change(function () {
    QRCode.toCanvas(
        document.getElementById("EditQarCodeView"),
        $("#EditQarCodeID").val(), {
        errorCorrectionLevel: "H",
        margin: 1,
        width: $("#EditQarCodeWidth").val(),
    });
});

// 图片上传
$("#img_input2").on("change", function (e) {
    let file = e.target.files[0];
    if (!file.type.match("image.*")) {
        return false;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (arg) {
        let img =
            '<div style="position: fixed; margin: 0; overflow: hidden;width: 200px;height:150px;z-index:2" id="loadImg"><img style = "max-width:100%;max-height:100%; class="preview" src="' +
            arg.target.result +
            '" alt="preview"/></div';

        $("#printmain").append(img);
        drag(document.getElementById("loadImg"), { minSize: 30 });

    };
});

// 富文本初始化
$(function () {
    window.um = UM.getEditor("container", {
        toolbar: [
            "source | undo redo | bold italic underline strikethrough | superscript subscript | forecolor backcolor | removeformat |", "insertorderedlist insertunorderedlist | selectall cleardoc paragraph | fontfamily fontsize", "| justifyleft justifycenter justifyright justifyjustify |", "link unlink | emotion | horizontal  preview fullscreen", "formula",
        ],
    });
});

// 富文本事件
let eleId;
let allNum = 0;
$("#update").click(function () {
    $("#" + eleId).html(um.getContent());
    /* 赋值数据 */
    $("#" + eleId).attr('data-text', $("#databind").val())
    $("#exampleModalCenter").modal("hide");
});


/**
 * 文本事件
 * @param {number} n 文本ID
 */
const addText = document.getElementById("textBtn");
const Print = document.getElementById("print");
let n = 0;
addText.onclick = function () {
    $("#printmain")
        .append(`<div style="position: fixed; margin: 0;overflow: hidden;width: 120px;height:35px;z-index:2"class='editable refbox'
             id=${"text" + n}><p contenteditable="true" style="height:100%">Text</p></div>`);

    drag(document.getElementById("text" + n), { minSize: 35 });
    $("#text" + n).click()
    n++;
    allNum++;
};

// 打印
Print.onclick = function () {
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

    /*     iframe 打印
        function doPrint3 () {
            //判断iframe是否存在，不存在则创建iframe
            var iframe = document.getElementById("print-iframe");
            if (!iframe) {
                var el = document.getElementById("printmain");
                iframe = document.createElement('IFRAME');
                var doc = null;
                iframe.setAttribute("id", "print-iframe");
                iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
                document.body.appendChild(iframe);
                doc = iframe.contentWindow.document;
                //这里可以自定义样式
                //doc.write("<LINK rel="stylesheet" type="text/css" href="css/print.css">");
                doc.write('<div>' + el.innerHTML + '</div>');
                doc.close();
                iframe.contentWindow.focus();
            }
            iframe.contentWindow.print();
            if (navigator.userAgent.indexOf("MSIE") > 0) {
                document.body.removeChild(iframe);
            }
        }
    
        doPrint3()
        let iframe = document.getElementById('testww')
        console.log(iframe.contentWindow === window.frames[0]) */
};


/**
 * line线条事件
 * @param {number} d 线条ID
 */
const addLine = document.getElementById("line");
let d = 0;
addLine.onclick = function () {
    $("#printmain").append(`<div id=${"lineDiv" + d} class='Line refbox' style="position:fixed;top:200px;left:200px; margin: 0; overflow: hidden;
	width:200px;height:3px;max-height:4px;min-height:3px;background-color:black;z-index:2"></div>`);

    drag(document.getElementById("lineDiv" + d), { minSize: 3 });
    d++;
    allNum++;
};

/**
 * box方框事件
 * @param {number} h boxID
 */
const addBox = document.getElementById("box");
let h = 0;
addBox.onclick = function () {
    $("#printmain").append(`<div id="${
        "boxDiv" + h}" class='Box refbox ' style="position: fixed;top:117px; margin: 0; overflow: hidden;width:200px;height:180px;border: 1px solid black;z-index:1;"></div>`);
    drag(document.getElementById("boxDiv" + h), { minSize: 30 });

    h++;
    allNum++;
};

/**
 * setting设置事件
 * @param {number}
 */

const pageSet = document.getElementById("setting");
const updateSet = document.getElementById("settingok");
const labelRow = document.getElementById("labelRow");
const labelColumn = document.getElementById("labelColumn");
const firstBox = document.getElementById("demo");
const childs = document.getElementById("printmain").children;
const Row = $("#row").find("canvas")[0];
const Column = $("#column").find("canvas")[0];
pageSet.onclick = function () {
    $("#codeSetting").modal({
        backdrop: 'static'
    });
    let width = firstBox.style.width;
    let height = firstBox.style.height;
    let boxwidth = width.slice(0, width.length - 2);
    let boxheight = height.slice(0, height.length - 2);

    updateSet.onclick = function () {
        // 行列设置
        let labelrow = labelRow.value;
        let labelcolumn = labelColumn.value;
        let rowok = boxwidth * labelrow > Number(Row.width / 2) - 20 ? true : false;
        let columnok =
            boxheight * labelcolumn > Number(Column.height / 2) - 20 ? true : false;

        if (!rowok && !columnok) {
            // 获取模板框内各项元素
            const prototypeBox = $("#printmain").children("div .Box");
            const prototypeText = $("#printmain").children("div .editable");
            const prototypeBarCode = $("#printmain").children("div .BarCodedbclick");
            const prototypeQarCode = $("#printmain").children("div .QarCodedbclick");
            const prototypeLine = $("#printmain").children("div .Line");
            let randomNum = 100;
            let columnRandomNum = 50;
            let columnRun = true;

            // 开始行 计数 行结束后触发列
            for (var addnum = 1; addnum < labelRow.value; addnum++) {
                addRow();
                randomNum--;
                if (addnum == labelRow.value - 1) {
                    columnRun = true;
                }
            }

            // 开始列
            if (columnRun) {
                for (var columnaddnum = 1; columnaddnum < labelColumn.value; columnaddnum++) {
                    for (var columnnum = 0; columnnum < labelRow.value; columnnum++) {
                        addColumn();
                        columnRandomNum--;
                    }
                }
            }

            // 新增行
            function addRow () {
                // box框
                let newBox = prototypeBox.clone();
                for (var i = 0; i < newBox.length; i++) {
                    newBox[i].id = newBox[i].id + randomNum
                    newBox[i].style.left =
                        Number(newBox[i].style.left.slice(0, newBox[i].style.left.length - 2)) + Number(boxwidth * addnum) + "px"

                    $("#printmain").append(newBox[i])
                    randomNum--
                }

                // 文本框
                let newText = prototypeText.clone();
                if (prototypeText.length !== 0) {
                    for (var i = 0; i < newText.length; i++) {
                        newText[i].id = newText[i].id.slice(0, newText[i].id.length - 1) + randomNum
                        newText[i].style.left =
                            Number(newText[i].style.left.slice(0, newText[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        $("#printmain").append(newText[i])
                        drag(document.getElementById("text" + randomNum), { minSize: 35 });
                        randomNum--
                    }
                }

                // 线条
                let newLine = prototypeLine.clone();
                if (prototypeLine.length !== 0) {
                    for (var i = 0; i < newLine.length; i++) {
                        newLine[i].id = newLine[i].id.slice(0, newLine[i].id.length - 1) + randomNum
                        newLine[i].style.left =
                            Number(newLine[i].style.left.slice(0, newLine[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        $("#printmain").append(newLine[i])
                        drag(document.getElementById("lineDiv" + randomNum), { minSize: 3 });
                        randomNum--
                    }
                }

                // 一维码
                let newBarCode = prototypeBarCode.clone();
                if (prototypeBarCode.length !== 0) {
                    for (var i = 0; i < newBarCode.length; i++) {
                        newBarCode[i].id = newBarCode[i].id.slice(0, newBarCode[i].id.length - 1) + randomNum

                        newBarCode[i].style.left =
                            Number(newBarCode[i].style.left.slice(0, newBarCode[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        newBarCode[i].firstElementChild.id =
                            newBarCode[i].firstElementChild.id.slice(0, newBarCode[i].firstElementChild.id.length - 1) + randomNum

                        $("#printmain").append(newBarCode[i]);
                        // 优先级 修改值 > 原始值 > 默认值
                        let barcodevalue, barcodeformat, barcodeheight, barcodewidth;
                        if ($("#EditBarCodeID").val() == "") {
                            barcodevalue = chooseBdata || $("#BarCodeID").val() || 'dafult';
                            barcodeformat = $("#BarCodeType").val();
                            barcodeheight = $("#BarCodeHeight").val();
                            barcodewidth = $("#BarCodeWidth").val();
                        } else {
                            barcodevalue = chooseBdata || $("#EditBarCodeID").val() || 'dafult';
                            barcodeformat = $("#EditBarCodeType").val();
                            barcodeheight = $("#EditBarCodeHeight").val();
                            barcodewidth = $("#EditBarCodeWidth").val();
                        }
                        JsBarcode("#BarCode" + randomNum, barcodevalue, {
                            format: barcodeformat,
                            height: 25 || barcodeheight,
                            width: 2 || barcodewidth,
                            font: 'Sans-serif',
                        });
                        drag(document.getElementById("Code" + randomNum), { minSize: 52 });
                        randomNum--
                    }
                }

                // 二维码
                let newQarCode = prototypeQarCode.clone();
                if (prototypeQarCode.length !== 0) {
                    for (let i = 0; i < newQarCode.length; i++) {
                        newQarCode[i].id = newQarCode[i].id.slice(0, newQarCode[i].id.length - 1) + randomNum

                        newQarCode[i].style.left =
                            Number(newQarCode[i].style.left.slice(0, newQarCode[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        newQarCode[i].firstElementChild.id =
                            newQarCode[i].firstElementChild.id.slice(0, newQarCode[i].firstElementChild.id.length - 1) + randomNum

                        $("#printmain").append(newQarCode[i]);
                        // 优先级 修改值 > 原始值 > 默认值
                        let qarcodevalue, qarcodewidth;
                        if ($("#EditQarCodeID").val() == "") {
                            qarcodevalue = chooseQdata || $("#QarCodeID").val() || 'dafult';
                            qarcodewidth = $("#QarCodeWidth").val();
                        } else {
                            qarcodevalue = chooseQdata || $("#EditQarCodeID").val() || 'dafult';
                            qarcodewidth = $("#EditQarCodeWidth").val();
                        }
                        QRCode.toCanvas(document.getElementById("QarCode" + randomNum), qarcodevalue, {
                            margin: 1,
                            width: 64 || qarcodewidth
                        });

                        drag(document.getElementById("QrCode" + randomNum), { minSize: 30 });
                        randomNum--
                    }
                }
            }

            // 新增列
            function addColumn () {
                // box框
                let newcolumnBox = prototypeBox.clone();
                for (var i = 0; i < newcolumnBox.length; i++) {
                    newcolumnBox[i].id = newcolumnBox[i].id.slice(0, newcolumnBox[i].id.length - 1) + columnRandomNum

                    newcolumnBox[i].style.left =
                        Number(newcolumnBox[i].style.left.slice(0, newcolumnBox[i].style.left.length - 2)) +
                        Number(boxwidth * columnnum) + "px"

                    newcolumnBox[i].style.top =
                        Number(newcolumnBox[i].style.top.slice(0, newcolumnBox[i].style.top.length - 2)) +
                        Number(boxheight * columnaddnum) + "px"

                    $("#printmain").append(newcolumnBox[i]);
                    columnRandomNum--
                }

                // 文本框
                let newcolumnText = prototypeText.clone();
                if (prototypeText.length !== 0) {
                    for (var i = 0; i < newcolumnText.length; i++) {
                        newcolumnText[i].id = newcolumnText[i].id.slice(0, newcolumnText[i].id.length - 1) + columnRandomNum

                        newcolumnText[i].style.left =
                            Number(newcolumnText[i].style.left.slice(0, newcolumnText[i].style.left.length - 2)) +
                            Number(boxwidth * columnnum) + "px"

                        newcolumnText[i].style.top =
                            Number(newcolumnText[i].style.top.slice(0, newcolumnText[i].style.top.length - 2)) +
                            Number(boxheight * columnaddnum) + "px"

                        $("#printmain").append(newcolumnText[i]);
                        drag(document.getElementById("text" + columnRandomNum), { minSize: 35 });
                        columnRandomNum--
                    }
                }

                // 线条
                let newcolumnLine = prototypeLine.clone();
                if (prototypeLine.length !== 0) {
                    for (var i = 0; i < newcolumnLine.length; i++) {
                        newcolumnLine[i].id = newcolumnLine[i].id.slice(0, newcolumnLine[i].id.length - 1) + columnRandomNum

                        newcolumnLine[i].style.left =
                            Number(newcolumnLine[i].style.left.slice(0, newcolumnLine[i].style.left.length - 2)) +
                            Number(boxwidth * columnnum) + "px"

                        newcolumnLine[i].style.top =
                            Number(newcolumnLine[i].style.top.slice(0, newcolumnLine[i].style.top.length - 2)) +
                            Number(boxheight * columnaddnum) + "px"

                        $("#printmain").append(newcolumnLine[i]);
                        drag(document.getElementById("lineDiv" + columnRandomNum), { minSize: 3 });
                        columnRandomNum--
                    }
                }

                // 一维码
                let newcolumnBarCode = prototypeBarCode.clone();
                if (prototypeBarCode.length !== 0) {
                    for (var i = 0; i < newcolumnBarCode.length; i++) {
                        newcolumnBarCode[i].id =
                            newcolumnBarCode[i].id.slice(0, newcolumnBarCode[i].id.length - 1) + columnRandomNum

                        newcolumnBarCode[i].style.left =
                            Number(newcolumnBarCode[i].style.left.slice(0, newcolumnBarCode[i].style.left.length - 2)) +
                            Number(boxwidth * columnnum) + "px"

                        newcolumnBarCode[i].style.top =
                            Number(newcolumnBarCode[i].style.top.slice(0, newcolumnBarCode[i].style.top.length - 2)) +
                            Number(boxheight * columnaddnum) + "px"

                        newcolumnBarCode[i].firstElementChild.id =
                            newcolumnBarCode[i].firstElementChild.id.slice(0, newcolumnBarCode[i].firstElementChild.id.length - 1) + columnRandomNum

                        $("#printmain").append(newcolumnBarCode[i]);
                        let barcodevalue, barcodeformat, barcodeheight, barcodewidth;
                        // 优先级 修改值 > 原始值 > 默认值
                        if ($("#EditBarCodeID").val() == "") {
                            barcodevalue = chooseBdata || $("#BarCodeID").val() || 'dafult';
                            barcodeformat = $("#BarCodeType").val();
                            barcodeheight = $("#BarCodeHeight").val();
                            barcodewidth = $("#BarCodeWidth").val();
                        } else {
                            barcodevalue = chooseBdata || $("#EditBarCodeID").val() || 'dafult';
                            barcodeformat = $("#EditBarCodeType").val();
                            barcodeheight = $("#EditBarCodeHeight").val();
                            barcodewidth = $("#EditBarCodeWidth").val();
                        }
                        JsBarcode("#BarCode" + columnRandomNum, barcodevalue, {
                            format: barcodeformat,
                            height: 25 || barcodeheight,
                            width: 2 || barcodewidth,
                            font: 'Sans-serif',
                        });

                        drag(document.getElementById("Code" + columnRandomNum), { minSize: 52 });
                        columnRandomNum--
                    }
                }

                // 二维码
                let newcolumnQarCode = prototypeQarCode.clone();
                if (prototypeQarCode.length !== 0) {
                    for (var i = 0; i < newcolumnQarCode.length; i++) {
                        newcolumnQarCode[i].id =
                            newcolumnQarCode[i].id.slice(0, newcolumnQarCode[i].id.length - 1) + columnRandomNum

                        newcolumnQarCode[i].style.left =
                            Number(newcolumnQarCode[i].style.left.slice(0, newcolumnQarCode[i].style.left.length - 2)) +
                            Number(boxwidth * columnnum) + "px"

                        newcolumnQarCode[i].style.top =
                            Number(newcolumnQarCode[i].style.top.slice(0, newcolumnQarCode[i].style.top.length - 2)) +
                            Number(boxheight * columnaddnum) + "px"

                        newcolumnQarCode[i].firstElementChild.id =
                            newcolumnQarCode[i].firstElementChild.id.slice(0, newcolumnQarCode[i].firstElementChild.id.length - 1) + columnRandomNum

                        $("#printmain").append(newcolumnQarCode[i]);
                        // 优先级 修改值 > 原始值 > 默认值
                        let qarcodevalue, qarcodewidth;
                        if ($("#EditQarCodeID").val() == "") {
                            qarcodevalue = chooseQdata || $("#QarCodeID").val() || 'dafult';
                            qarcodewidth = $("#QarCodeWidth").val();
                        } else {
                            qarcodevalue = chooseQdata || $("#EditQarCodeID").val() || 'dafult';
                            qarcodewidth = $("#EditQarCodeWidth").val();
                        }
                        QRCode.toCanvas(
                            document.getElementById("QarCode" + columnRandomNum), qarcodevalue, {
                            margin: 1,
                            width: 64 || qarcodewidth
                        });

                        drag(document.getElementById("QrCode" + columnRandomNum), { minSize: 30 });
                        columnRandomNum--
                    }
                }
            }
            $("#codeSetting").modal("hide");
        } else if (rowok) {
            $("#labelRowError").html("标签宽度超出，请调整");
            setTimeout(function () {
                $("#labelRowError").html("");
            }, 1500);
        } else {
            $("#labelColumnError").html("标签高度超出，请调整");
            setTimeout(function () {
                $("#labelColumnError").html("");
            }, 1500);
        }
    };
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

let a
const templateBtn = document.getElementById("template");
for (let i = 0; i < localStorage.length; i++) {
    a = JSON.parse(localStorage.getItem(localStorage.key(i)));
    $("#card")
        .append(`<div class="card"><a id="${i}" href="#"><img id=${'img' + i} class="card-img-top" src=${a.img} alt="Card image cap"></a></div>`);

    let j = i;
    let b = a;
    // 将模板代码写入页面
    $("#" + j).click(function () {
        let x = $("#printmain").children()
        for (var i = 0; i < x.length; i++) {
            if (x[i].id !== 'demo') [
                x[i].remove()
            ]
        }

        let c = b.code.split('</div>')
        let d = c.slice(0, c.length - 1).join('</div>')
        $("#printmain").append(d);
        // 将拖拽事件赋给所有模板元素
        for (let l = 0; l < b.allNum; l++) {
            if (document.getElementById("text" + l)) {
                console.log('text++')
                drag(document.getElementById("text" + l), { minSize: 30 });
            }

            if (document.getElementById("BarCode" + l)) {
                console.log('barcode++')
                JsBarcode("#BarCode" + l, "default", {
                    width: 1,
                    height: 10,
                    font: 'Sans-serif',
                });
                drag(document.getElementById("Code" + l), { minSize: 30 });
            }

            if (document.getElementById("QrCode" + l)) {
                console.log('qarcode++')
                QRCode.toCanvas(document.getElementById("QarCode" + l), "default", {
                    margin: 1,
                });
                drag(document.getElementById("QrCode" + l), { minSize: 30 });
            }

            if (document.getElementById("lineDiv" + l)) {
                console.log('line++')
                drag(document.getElementById("lineDiv" + l), { minSize: 2 });
            }

            if (document.getElementById("boxDiv" + l)) {
                console.log('box++')
                drag(document.getElementById("boxDiv" + l), { minSize: 30 });
            }
        }
        $("#templatemodel").modal("hide");
    });
}

// 模板模态框
templateBtn.onclick = function () {
    $("#templatemodel").modal({
        backdrop: 'static'
    });

    // 使用模板后更新常量值避免与新增元素ID冲突
    n = a.textlength;
    j = a.barcode;
    k = a.qarcode;
    d = a.lineDiv;
    h = a.boxDiv;
};

// 模板保存
const saveTemplate = document.getElementById("save");
const createFile = document.getElementById("createFileSureBut")
saveTemplate.onclick = function () {
    $("#createFileModal").modal("show");

    createFile.onclick = function () {
        var data = $("#fileName").val();
        // 将当前模板框内元素html保存，并生成预览图
        let width = $("#demo").width()
        let height = $("#demo").height()
        $("#printmain").width(width)
        $("#printmain").height(height)
        html2canvas(document.getElementById("printmain")).then(function (canvas) {
            var imgUrl = canvas.toDataURL("image/png");
            var value = {
                code: $("#printmain").html(),
                img: imgUrl,
                allNum: allNum,
                textlength: n,
                barcode: j,
                qarcode: k,
                lineDiv: d,
                boxDiv: h,
            };

            // 存入 localStorage
            localStorage.setItem(data, JSON.stringify(value));
            console.log('load ➡ over')
            location.reload();
        })

        $("#createFileModal").modal("hide");
    };
};