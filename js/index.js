"use strict";
/**
 * injectDragger
 * @param {Document} EditBarCodeFromOk btn ==> set barcode
 * @param {Number || String} editcodeval data ==> barcode.data
 * @param {Document} EditQarCodeFromOk btn ==> set qarcode
 * @param {Number || String} editqarcodeval data ==> qarcode.data
 */

const eleRemove = document.getElementById("remove")
function injectDragger (ele, config = {}) {
    let removeDragger;
    /* click event */
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

    /* dbclick event */
    ele.addEventListener("dblclick", () => {
        console.log(ele.id + ' dbclick event')
        if (ele.className == "editable refbox") {
            /* text dbclick event */
            eleId = ele.id;
            $("#exampleModalCenter").modal({
                backdrop: 'static'
            })
            um.setContent(
                $("#" + ele.id)
                    .children()
                    .html()
            );
        } else if (ele.className == "BarCodedbclick refbox") {
            /* barcode dbclick  */
            ele.addEventListener("dblclick", () => {
                /* get data */
                let a = JSON.parse(sessionStorage.getItem(ele.id));
                $("#EditbarcodeformModalCenter").modal({
                    backdrop: 'static'
                });
                JsBarcode("#EditBarCodeView", a.data, {
                    format: a.format,
                    height: a.height,
                    width: a.width,
                });

                /* set Form */
                $("#EditBarCodeID").val(a.data);
                $("#EditBarCodeType").val(a.format);
                $("#EditBarCodeHeight").val(a.height);
                $("#EditBarCodeWidth").val(a.width);
            });

            /* Form data => barcode */
            const EditBarCodeFromOk = document.getElementById("EditBarCodeFormok");
            EditBarCodeFromOk.onclick = function () {
                JsBarcode("#Bar" + ele.id, $("#EditBarCodeID").val(), {
                    format: $("#EditBarCodeType").val(),
                    height: $("#EditBarCodeHeight").val(),
                    width: $("#EditBarCodeWidth").val(),
                });
                /* update saveData */
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
            /* qarcode dbclick event */
            ele.addEventListener("dblclick", () => {
                /* get data */
                let b = JSON.parse(sessionStorage.getItem(ele.id));
                $("#EditqarcodeformModalCenter").modal({
                    backdrop: 'static'
                });
                QRCode.toCanvas(document.getElementById("EditQarCodeView"), b.data);
                /* set formData */
                $("#EditQarCodeID").val(b.data);
                $("#EditQarCodeWidth").val(b.width)
            });

            /* form data => qarcode */
            const EditQarCodeFromOk = document.getElementById("EditQarCodeFormok");
            EditQarCodeFromOk.onclick = function () {
                let qrid = ele.id;
                let num = qrid.split('').slice(6, qrid.length).join('')
                QRCode.toCanvas(document.getElementById("QarCode" + num),
                    $("#EditQarCodeID").val(), {
                    width: $("#EditQarCodeWidth").val()
                });

                /* update saveData */
                const editqarcodeval = {
                    id: ele.id,
                    data: $("#EditQarCodeID").val(),
                };

                sessionStorage.setItem(ele.id, JSON.stringify(editqarcodeval));
                $("#EditqarcodeformModalCenter").modal("hide");
            };
        }
    }, false);
}

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
            /* 修改key */
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

                if (`${newT + detaY}` <= 95) {
                    ele._style_.top = `${95}px`
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

/**
 * table data choose
 * @param {Object} allData data
 * @param {Object} newData choose row's data in table
 * @param {Number || String} Data row's data.id
 * @param {Number || String} Datavalue row's data.id.value
 * @param {Document} edittext pageTextBox
 */

const pullData = document.getElementById("pull");
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
        },
    });
    return result;
})();

/* pull btn */
pullData.onclick = function () {
    $table.bootstrapTable({ data: allData.data });
    $("#tableview").modal({
        backdrop: 'static'
    });
};

/**
 * row data choose
 * @param {Object} Data data
 * @param {Object} Datavalue  data.value
 * @param {Document} edittext page ==> TextBox
 * @param {Number} pageLength page ==> TextBox.length
 * @param {Number} pullLength data ==> TextBox.length
*/
$(function () {
    $multPrint.click(function () {
        /* get all choose */
        const chooseData = $table.bootstrapTable("getSelections")

        /* get all hidden */
        const hiddenData = $table.bootstrapTable('getHiddenColumns').map(x => x.field)

        /* get page TextBox */
        const pageText = $("#printmain").children("div .editable");
        const pageBarCode = $("#printmain").children("div .BarCodedbclick");
        const pageQarCode = $("#printmain").children("div .QarCodedbclick");

        /* get data */
        for (var c = 0; c < chooseData.length; c++) {
            for (var h = 0; h < hiddenData.length; h++) {
                delete chooseData[c][hiddenData[h]]
            }
        }

        /* get data id value */
        const dataList = chooseData.map(x =>
            Object.keys(x).filter(y => y !== 'id' && y !== 'barcode' && y !== 'qarcode' && y !== 'state'))

        const dataValueList = Object.values(chooseData)

        const firstBox = document.getElementById("demo");
        let height = firstBox.style.height;
        let boxheight = height.slice(0, height.length - 2);
        let nums = 200
        for (var i = 1; i < chooseData.length; i++) {
            console.log(`第${i}个模板`)
            let newBarCode = pageBarCode.clone()
            let newQarCode = pageQarCode.clone()
            for (var name in chooseData[i]) {
                /* barcode setting */
                if (name == 'barcode') {
                    if (newBarCode.length > 0) {
                        console.log(`第${i}个一维码`)
                        newBarCode[0].id = newBarCode[0].id.slice(0, newBarCode[0].id.length - 1) + nums

                        newBarCode[0].style.top =
                            Number(newBarCode[0].style.top.slice(0, newBarCode[0].style.top.length - 2)) +
                            Number(boxheight * i) + "px"

                        newBarCode[0].firstElementChild.id =
                            newBarCode[0].firstElementChild.id.slice(0, newBarCode[0].firstElementChild.id.length - 1) + nums

                        $("#printmain").append(newBarCode[0]);
                        JsBarcode("#BarCode" + nums, chooseData[i][name], {
                            format: 'CODE128',
                            height: 20,
                            width: 2,
                        });
                    }
                }

                /* qarcode setting */
                if (name == 'qarcode') {
                    if (newQarCode.length > 0) {
                        console.log(`第${i}个二维码`)
                        newQarCode[0].id = newQarCode[0].id.slice(0, newQarCode[0].id.length - 1) + nums

                        newQarCode[0].style.top =
                            Number(newQarCode[0].style.top.slice(0, newQarCode[0].style.top.length - 2)) +
                            Number(boxheight * i) + "px"

                        newQarCode[0].firstElementChild.id =
                            newQarCode[0].firstElementChild.id.slice(0, newQarCode[0].firstElementChild.id.length - 1) + nums

                        $("#printmain").append(newQarCode[0]);
                        QRCode.toCanvas(document.getElementById("QarCode" + nums), toString(chooseData[i][name]), {
                            margin: 1,
                            width: 64,
                        });
                    }
                }
            }
            nums--
        }

        /* textBox setting */
        for (var i = 0; i < pageText.length; i++) {
            pageText[i].firstChild.innerHTML = `${dataList[0][i]}:${dataValueList[0][dataList[0][i]]}`
        }

        for (var i = 1; i < dataList.length; i++) {
            console.log(`第${i}个模板`)
            let pullData = dataList[i]
            let pullDataValue = dataValueList[i]
            for (var j = 0; j < pageText.length; j++) {
                let newText = pageText.clone()
                newText[j].style.top =
                    Number(newText[j].style.top.slice(0, newText[j].style.top.length - 2)) +
                    Number(boxheight * i) + "px"

                $("#printmain").append(newText[j])
                newText[j].firstChild.innerHTML = `${pullData[j]}:${pullDataValue[pullData[j]]}`;
                console.log(`第${j}个文本框 => ${pullData[j]}:${pullDataValue[pullData[j]]}`)
            }
        }
    })
})

$(function () {
    $button.click(function () {
        console.log('pulling~')
        const newData = $table.bootstrapTable("getSelections")[0];
        console.log($table.bootstrapTable("getSelections"))
        const testData = $table.bootstrapTable('getHiddenColumns').map(x => x.field)

        for (var test = 0; test < testData.length; test++) {
            delete newData[testData[test]]
        }

        /* add testBox */
        const datalist = Object.keys(newData).filter(x => x !== 'id' && x !== 'barcode' && x !== 'qarcode');
        const datavaluelist = Object.values(newData);
        const textBox = document.getElementsByClassName("editable");
        let marginLeft = 100;
        let pullDataText = []
        let pullDataId = []

        /* choose setting */
        for (var name in newData) {
            if (typeof newData[name] == 'string' && name !== 'barcode' && name !== 'qarcode') {
                pullDataId.push(name)
                pullDataText.push(newData[name])
            }

            if (name == 'barcode') {
                $("#printmain").append(
                    `<div id=${"Code" + j} style="position: fixed; margin: 0; overflow: hidden;z-index:2" class="BarCodedbclick refbox">
                    <canvas id=${"BarCode" + j}></canvas>
                    </div>`
                );

                JsBarcode("#BarCode" + j, newData[name], {
                    format: 'CODE128',
                    height: 25,
                    width: 2,
                });
                injectDragger(document.getElementById("Code" + j), { minSize: 52 });
                j++
            }

            if (name == 'qarcode') {
                $("#printmain").append(`<div id=${"QrCode" + k} style="position: fixed; margin: 0; overflow: hidden;z-index:2" class="QarCodedbclick refbox"><canvas id=${"QarCode" + k}></canvas></div>`);

                QRCode.toCanvas(document.getElementById("QarCode" + k), toString(newData[name]), {
                    margin: 1,
                    width: 64,
                });
                injectDragger(document.getElementById("QrCode" + k), { minSize: 30 });
                k++
            }
        }

        let pageTextLength = textBox.length
        let pullTextLength = pullDataText.length
        let creatTextLength = pullTextLength - pageTextLength

        console.log("get text ==> " + "已有:" + pageTextLength, "共有:" + pullTextLength, "还缺:" + creatTextLength)
        /* set data ==> pageText  */
        for (let i = 0; i < pageTextLength; i++) {
            textBox[i].firstChild.innerHTML = `${datalist[i]}:${datavaluelist[i]}`;
            console.log('数据写入 ==> ' + `${datalist[i]}:${datavaluelist[i]}`)
        }

        /* set new text && set data ==> newPageText */
        let creatTextBox = true
        if (creatTextBox) {
            for (let n = pageTextLength; n < pullTextLength; n++) {
                console.log("set newtext:" + n, '数据 ==> ' + pullDataId[n] + ':' + pullDataText[n]);
                $("#printmain").append(
                    `<div style="position: fixed; margin: 0; overflow: hidden;left:${marginLeft}px;width: 100px;height:35px;z-index:2"class='editable refbox' id=${
                    "text" + n}><p contenteditable="true">Text</p></div>`
                );
                document.getElementById("text" + n).firstChild.innerHTML = `${pullDataId[n]}:${pullDataText[n]}`;
                injectDragger(document.getElementById("text" + n), { minSize: 35 });

                allNum++;
                marginLeft += 100;
            }
        }
        $("#tableview").modal("hide");
    });
});

/**
 * 一维码表单事件
 * @param {Document} BarCodeFormModel button ==> create barcode
 * @param barcodeformModalCenter box ==> barcode modal
 * @param {Document} BarCodeFromOk button ==> create
 * @param {Number} j barcode.id
 * @param {Number} allNum all btn
 * @param JsBarcode BarCode
 */


const BarCodeFormModel = document.getElementById("BarCodeFormModel");
const BarCodeFormOk = document.getElementById("BarCodeFormok");
let j = 0;

BarCodeFormModel.onclick = function () {
    $("#barcodeformModalCenter").modal({
        backdrop: 'static'
    });
    /* code view */
    JsBarcode("#BarCodeView", "data", {
        format: "CODE128",
        height: parseInt($("#BarCodeHeight").val()),
        width: $("#BarCodeWidth").val(),
    });

    /* use id pull barcodeID */
    const testbtn = document.getElementById("loadBarCodeID");
    testbtn.onclick = function () {
        var resid = $("#BarCodeProductID").val();
        for (var i = 0; i < allData.data.length; i++) {
            if (allData.data[i].id == resid) {
                $("#BarCodeID").val(allData.data[i].barcode);
                console.log('BarCode is pulling:' + allData.data[i].barcode)
            }
        }
    }
};

/* editform use id pull barcodeID */
$("#EditloadBarCodeID").click(function () {
    var resid = $("#EditBarCodeProductID").val();
    for (var i = 0; i < allData.data.length; i++) {
        if (allData.data[i].id == resid) {
            $("#EditBarCodeID").val(allData.data[i].barcode);
            console.log('EditBarCode is pulling:' + allData.data[i].barcode)
        }
    }
});

BarCodeFormOk.onclick = function () {
    $("#printmain").append(
        `<div id=${"Code" + j} style="position: fixed; margin: 0; overflow: hidden;z-index:2" class="BarCodedbclick refbox">
		<canvas id=${"BarCode" + j}></canvas>
		</div>`
    );

    injectDragger(document.getElementById("Code" + j), { minSize: 52 });
    JsBarcode("#BarCode" + j, $("#BarCodeID").val(), {
        format: $("#BarCodeType").val(),
        height: $("#BarCodeHeight").val(),
        width: $("#BarCodeWidth").val(),
    });
    $("#BarCode" + j).click()

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

/* barcode Form change view */
$("#BarCodeForm").change(function () {
    JsBarcode("#BarCodeView", $("#BarCodeID").val(), {
        format: $("#BarCodeType").val(),
        height: $("#BarCodeHeight").val(),
        width: $("#BarCodeWidth").val(),
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

/* barcode Form change event */
$("#EditBarCodeForm").change(function () {
    JsBarcode("#EditBarCodeView", $("#EditBarCodeID").val(), {
        format: $("#EditBarCodeType").val(),
        height: $("#EditBarCodeHeight").val(),
        width: $("#EditBarCodeWidth").val(),
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
 * @param QarCodeFormModel btn ==> create qarcode
 * @param qarcodeformModalCenter qarcode modal
 * @param QarCodeFromOk btn ==> create
 * @param k qarcode.id
 * @param allNum all btn
 * @param QRCode QarCode
 */
const QarCodeFormModel = document.getElementById("QarCodeFormModel");
const QarCodeFormok = document.getElementById("QarCodeFormok");
let k = 0;
QarCodeFormModel.onclick = function () {
    $("#qarcodeformModalCenter").modal({
        backdrop: 'static'
    });
    /* qrcode view */
    QRCode.toCanvas(document.getElementById("QarCodeView"), "data", {
        errorCorrectionLevel: "H",
    });
};

/* use id pull qarcodeID */
$("#loadQarCodeID").click(function () {
    let resid = $("#QarCodeProductID").val();
    for (let i = 0; i < allData.data.length; i++) {
        if (allData.data[i].id == resid) {
            $("#QarCodeID").val(allData.data[i].qarcode);
            console.log('QarCodeId pulling:' + allData.data[i].qarcode)
        }
    }
});

/* edit use id pull qarcodeID */
$("#EditloadQarCodeID").click(function () {
    let resid = $("#EditQarCodeProductID").val();
    for (let i = 0; i < allData.data.length; i++) {
        if (allData.data[i].id == resid) {
            $("#EditQarCodeID").val(allData.data[i].qarcode);
            console.log('EditQarCodeId pulling:' + allData.data[i].qarcode)
        }
    }
});

/* qarcode */
QarCodeFormok.onclick = function () {
    $("#printmain").append(`<div id=${
        "QrCode" + k} style="position: fixed; margin: 0; overflow: hidden;z-index:2" class="QarCodedbclick refbox">
		<canvas id=${"QarCode" + k}></canvas></div>`
    );

    injectDragger(document.getElementById("QrCode" + k), { minSize: 30 });
    QRCode.toCanvas(document.getElementById("QarCode" + k), $("#QarCodeID").val(), {
        margin: 1,
        width: $("#QarCodeWidth").val(),
    });
    $("#QarCode" + k).click()

    $("#qarcodeformModalCenter").modal("hide");
    const qrcodeval = {
        id: "QrCode" + k,
        data: $("#QarCodeID").val(),
        width: $("#QarCodeWidth").val()
    };
    sessionStorage.setItem("QrCode" + j, JSON.stringify(qrcodeval));
    k++;
    allNum++;
};

/* qarcode Form change view */
$("#QarCodeForm").change(function () {
    console.log($("#QarCodeID").val());
    QRCode.toCanvas(
        document.getElementById("QarCodeView"),
        $("#QarCodeID").val(), {
        errorCorrectionLevel: "H",
        margin: 1,
        width: $("#QarCodeWidth").val(),
    });
});

/* qarcode Form change event */
$("#EditQarCodeForm").change(function () {
    QRCode.toCanvas(
        document.getElementById("EditQarCodeView"),
        $("#EditQarCodeID").val(), {
        errorCorrectionLevel: "H",
        margin: 1,
        width: $("#EditQarCodeWidth").val(),
    });
});

/* img btn */
$("#img_input2").on("change", function (e) {
    /* img data */
    let file = e.target.files[0];
    if (!file.type.match("image.*")) {
        return false;
    }

    /* render img */
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (arg) {
        let img =
            '<div style="position: fixed; margin: 0; overflow: hidden;width: 200px;height:150px;z-index:2" id="loadImg"><img style = "max-width:100%;max-height:100%; class="preview" src="' +
            arg.target.result +
            '" alt="preview"/></div';

        $("#printmain").append(img);
        injectDragger(document.getElementById("loadImg"), { minSize: 30 });

    };
});

/* Rich text editor */
$(function () {
    window.um = UM.getEditor("container", {
        toolbar: [
            "source | undo redo | bold italic underline strikethrough | superscript subscript | forecolor backcolor | removeformat |", "insertorderedlist insertunorderedlist | selectall cleardoc paragraph | fontfamily fontsize",
            "| justifyleft justifycenter justifyright justifyjustify |", "link unlink | emotion | horizontal  preview fullscreen", "formula",
        ],
    });
});

/* editor change */
let eleId;
let allNum = 0;
$("#update").click(function () {
    $("#" + eleId).html(um.getContent());
    $("#exampleModalCenter").modal("hide");
});

/**
 * text文本事件
 * @param addText btn ==> create textBox
 * @param n textBox.id
 * @param allNum all btn
 */
const addText = document.getElementById("textBtn");
const Print = document.getElementById("print");
let n = 0;
addText.onclick = function () {
    $("#printmain")
        .append(`<div style="position: fixed; margin: 0;overflow: hidden;width: 100px;height:35px;z-index:2"class='editable refbox'
		 id=${"text" + n}><p contenteditable="true" style="height:100%">Text</p></div>`);

    injectDragger(document.getElementById("text" + n), { minSize: 35 });
    $("#text" + n).click()
    n++;
    allNum++;
};

/* print */
Print.onclick = function () {
    printJS({
        printable: "printmain",
        type: "html",
        css: '/css/printjs.css'
    });
};

/**
 * line线条事件
 * @param lineBtn btn ==> create line
 * @param d line.id
 * @param allNum all btn
 */
const addLine = document.getElementById("line");
let d = 0;
addLine.onclick = function () {
    $("#printmain").append(`<div id=${"lineDiv" + d} class='Line refbox' style="position:fixed;top:200px;left:200px; margin: 0; overflow: hidden;
	width:200px;height:3px;max-height:4px;min-height:3px;background-color:black;z-index:2"></div>`);

    injectDragger(document.getElementById("lineDiv" + d), { minSize: 3 });
    d++;
    allNum++;
};

/**
 * box方框事件
 * @param box 方框生成
 * @param h 方框id
 * @param allNum 所有功能点击计数
 */
const addBox = document.getElementById("box");
let h = 0;
addBox.onclick = function () {
    $("#printmain").append(`<div id="${
        "boxDiv" + h
        }" class='Box refbox ' style="position: fixed; margin: 0; overflow: hidden;
			width:200px;height:200px;border: 1px solid black;z-index:1;"></div>`);
    injectDragger(document.getElementById("boxDiv" + h), { minSize: 30 });

    h++;
    allNum++;
};

/**
 * setting设置事件
 * @param codeSetting btn ==> setting
 * @param {Document} a object ==> DOMRect
 * @param {Number} pageHeight
 * @param {Number} pageWidth
 * @param {Number} boxleft
 * @param {Number} boxtop
 * @param {Number} boxright
 * @param {Number} boxbottom
 * @param {Number} labelRow
 * @param {Number} labelColumn
 * @param {Number} labelHeight
 * @param {Number} labelWidth
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
        /* row column */
        let labelrow = labelRow.value;
        let labelcolumn = labelColumn.value;
        let rowok = boxwidth * labelrow > Number(Row.width / 2) - 20 ? true : false;
        let columnok =
            boxheight * labelcolumn > Number(Column.height / 2) - 20 ? true : false;

        if (!rowok && !columnok) {
            /* pull text | barcode | qrcode | line | box */
            const prototypeBox = $("#printmain").children("div .Box");
            const prototypeText = $("#printmain").children("div .editable");
            const prototypeBarCode = $("#printmain").children("div .BarCodedbclick");
            const prototypeQarCode = $("#printmain").children("div .QarCodedbclick");
            const prototypeLine = $("#printmain").children("div .Line");
            let randomNum = 100;
            let columnRandomNum = 50;
            let columnRun = true;

            for (var addnum = 1; addnum < labelRow.value; addnum++) {
                addRow();
                randomNum--;
                /* row end */
                if (addnum == labelRow.value - 1) {
                    columnRun = true;
                }
            }

            /* column */
            if (columnRun) {
                for (var columnaddnum = 1; columnaddnum < labelColumn.value; columnaddnum++) {
                    for (var columnnum = 0; columnnum < labelRow.value; columnnum++) {
                        addColumn();
                        columnRandomNum--;
                    }
                }
            }

            /* new row */
            function addRow () {
                /* BoxClone */
                let newBox = prototypeBox.clone();
                /* new id | left */
                for (var i = 0; i < newBox.length; i++) {
                    newBox[i].id = newBox[i].id + randomNum
                    newBox[i].style.left =
                        Number(newBox[i].style.left.slice(0, newBox[i].style.left.length - 2)) + Number(boxwidth * addnum) + "px"

                    $("#printmain").append(newBox[i])
                    randomNum--
                }

                /* TextClone */
                let newText = prototypeText.clone();
                /* new id | left */
                if (prototypeText.length !== 0) {
                    for (var i = 0; i < newText.length; i++) {
                        newText[i].id = newText[i].id.slice(0, newText[i].id.length - 1) + randomNum
                        newText[i].style.left =
                            Number(newText[i].style.left.slice(0, newText[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        $("#printmain").append(newText[i])
                        injectDragger(document.getElementById("text" + randomNum), { minSize: 35 });
                        randomNum--
                    }
                }

                /* LineClone */
                let newLine = prototypeLine.clone();
                /* new id | left */
                if (prototypeLine.length !== 0) {
                    for (var i = 0; i < newLine.length; i++) {
                        newLine[i].id = newLine[i].id.slice(0, newLine[i].id.length - 1) + randomNum
                        newLine[i].style.left =
                            Number(newLine[i].style.left.slice(0, newLine[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        $("#printmain").append(newLine[i])
                        injectDragger(document.getElementById("lineDiv" + randomNum), { minSize: 3 });
                        randomNum--
                    }
                }

                /* BarCodeClone */
                let newBarCode = prototypeBarCode.clone();
                /* new id | left | canvasId */
                if (prototypeBarCode.length !== 0) {

                    for (var i = 0; i < newBarCode.length; i++) {
                        newBarCode[i].id = newBarCode[i].id.slice(0, newBarCode[i].id.length - 1) + randomNum

                        newBarCode[i].style.left =
                            Number(newBarCode[i].style.left.slice(0, newBarCode[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        newBarCode[i].firstElementChild.id =
                            newBarCode[i].firstElementChild.id.slice(0, newBarCode[i].firstElementChild.id.length - 1) + randomNum

                        $("#printmain").append(newBarCode[i]);
                        /* data | editor data */
                        let barcodevalue, barcodeformat, barcodeheight, barcodewidth;
                        if ($("#EditBarCodeID").val() == "") {
                            barcodevalue = $("#BarCodeID").val() || 'data';
                            barcodeformat = $("#BarCodeType").val();
                            barcodeheight = $("#BarCodeHeight").val();
                            barcodewidth = $("#BarCodeWidth").val();
                        } else {
                            barcodevalue = $("#EditBarCodeID").val() || 'data';
                            barcodeformat = $("#EditBarCodeType").val();
                            barcodeheight = $("#EditBarCodeHeight").val();
                            barcodewidth = $("#EditBarCodeWidth").val();
                        }
                        JsBarcode("#BarCode" + randomNum, barcodevalue, {
                            format: barcodeformat,
                            height: barcodeheight,
                            width: barcodewidth,
                        });
                        injectDragger(document.getElementById("Code" + randomNum), { minSize: 52 });
                        randomNum--
                    }
                }

                /* QrcodeClone */
                let newQarCode = prototypeQarCode.clone();
                /* new id left | canvasId */
                if (prototypeQarCode.length !== 0) {
                    for (let i = 0; i < newQarCode.length; i++) {
                        newQarCode[i].id = newQarCode[i].id.slice(0, newQarCode[i].id.length - 1) + randomNum

                        newQarCode[i].style.left =
                            Number(newQarCode[i].style.left.slice(0, newQarCode[i].style.left.length - 2)) +
                            Number(boxwidth * addnum) + "px"

                        newQarCode[i].firstElementChild.id =
                            newQarCode[i].firstElementChild.id.slice(0, newQarCode[i].firstElementChild.id.length - 1) + randomNum

                        $("#printmain").append(newQarCode[i]);
                        /* data | editor data */
                        let qarcodevalue, qarcodewidth;
                        if ($("#EditQarCodeID").val() == "") {
                            qarcodevalue = $("#QarCodeID").val() || 'data';
                            qarcodewidth = $("#QarCodeWidth").val();
                        } else {
                            qarcodevalue = $("#EditQarCodeID").val() || 'data';
                            qarcodewidth = $("#EditQarCodeWidth").val();
                        }
                        QRCode.toCanvas(document.getElementById("QarCode" + randomNum), qarcodevalue, {
                            margin: 1,
                            width: qarcodewidth
                        });

                        injectDragger(document.getElementById("QrCode" + randomNum), { minSize: 30 });
                        randomNum--
                    }
                }
            }

            /* new column */
            function addColumn () {
                /* ColumnBox clone */
                let newcolumnBox = prototypeBox.clone();

                /* new id | left | top */
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

                /* ColumnText clone */
                let newcolumnText = prototypeText.clone();

                /* new id | left | top */
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
                        injectDragger(document.getElementById("text" + columnRandomNum), { minSize: 35 });
                        columnRandomNum--
                    }
                }

                /* Line clone */
                let newcolumnLine = prototypeLine.clone();
                /* new id | left | top */
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
                        injectDragger(document.getElementById("lineDiv" + columnRandomNum), { minSize: 3 });
                        columnRandomNum--
                    }
                }

                /* BarCode clone */
                let newcolumnBarCode = prototypeBarCode.clone();
                /* new id | left | top | canvasId */
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
                        if ($("#EditBarCodeID").val() == "") {
                            barcodevalue = $("#BarCodeID").val() || 'data';
                            barcodeformat = $("#BarCodeType").val();
                            barcodeheight = $("#BarCodeHeight").val();
                            barcodewidth = $("#BarCodeWidth").val();
                        } else {
                            barcodevalue = $("#EditBarCodeID").val() || 'data';
                            barcodeformat = $("#EditBarCodeType").val();
                            barcodeheight = $("#EditBarCodeHeight").val();
                            barcodewidth = $("#EditBarCodeWidth").val();
                        }
                        JsBarcode("#BarCode" + columnRandomNum, barcodevalue, {
                            format: barcodeformat,
                            height: barcodeheight,
                            width: barcodewidth,
                        });

                        injectDragger(document.getElementById("Code" + columnRandomNum), { minSize: 52 });
                        columnRandomNum--
                    }
                }

                /* Qrcode clone */
                let newcolumnQarCode = prototypeQarCode.clone();
                /* new id | left | top | canvasId */
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
                        /* data | editor data */
                        let qarcodevalue, qarcodewidth;
                        if ($("#EditQarCodeID").val() == "") {
                            qarcodevalue = $("#QarCodeID").val() || 'data';
                            qarcodewidth = $("#QarCodeWidth").val();
                        } else {
                            qarcodevalue = $("#EditQarCodeID").val() || 'data';
                            qarcodewidth = $("#EditQarCodeWidth").val();
                        }
                        QRCode.toCanvas(
                            document.getElementById("QarCode" + columnRandomNum), qarcodevalue, {
                            margin: 1,
                            width: qarcodewidth
                        });

                        injectDragger(document.getElementById("QrCode" + columnRandomNum), { minSize: 30 });
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
 * @param templateBtn btn ==> load template
 * @param i btn ==> load btn
 * @param b data => template
 * @param l reload ==> allData
 * @param n text.length
 * @param j	barcode.length
 * @param k qarcode.length
 * @param m line.length
 * @param h box.length
 */

let a
const templateBtn = document.getElementById("template");
for (let i = 0; i < localStorage.length; i++) {
    a = JSON.parse(localStorage.getItem(localStorage.key(i)));
    $("#card")
        .append(`<div class="card"><a id="${i}" href="#"><img id=${'img' + i} class="card-img-top" src=${a.img} alt="Card image cap"></a></div>`);

    {/* <div class="card-body"><img id=${'img' + i} class="card-img-top" src=${a.img} data-holder-rendered="true"style="height: 200px; width: 200px;">
				<button type="button" class="btn btn-sm btn-primary" id="${i}">加载</button></div> */}
    let j = i;
    let b = a;
    /* code */
    $("#" + j).click(function () {
        let x = $("#printmain").children()
        console.log(x)
        for (var i = 0; i < x.length; i++) {
            if (x[i].id !== 'demo') [
                x[i].remove()
            ]
        }

        let c = b.code.split('</div>')
        let d = c.slice(1, c.length - 1).join('</div>')
        $("#printmain").append(d);
        /* Drag */
        for (let l = 0; l < b.allNum; l++) {
            if (document.getElementById("text" + l)) {
                console.log('text++')
                injectDragger(document.getElementById("text" + l), { minSize: 30 });
            }

            if (document.getElementById("BarCode" + l)) {
                console.log('barcode++')
                JsBarcode("#BarCode" + l, "default", {
                    width: 1,
                    height: 10,
                });
                injectDragger(document.getElementById("Code" + l), { minSize: 30 });
            }

            if (document.getElementById("QrCode" + l)) {
                console.log('qarcode++')
                QRCode.toCanvas(document.getElementById("QarCode" + l), "default", {
                    margin: 1,
                });
                injectDragger(document.getElementById("QrCode" + l), { minSize: 30 });
            }

            if (document.getElementById("lineDiv" + l)) {
                console.log('line++')
                injectDragger(document.getElementById("lineDiv" + l), { minSize: 2 });
            }

            if (document.getElementById("boxDiv" + l)) {
                console.log('box++')
                injectDragger(document.getElementById("boxDiv" + l), { minSize: 30 });
            }
        }
        $("#templatemodel").modal("hide");
    });
}

templateBtn.onclick = function () {
    $("#templatemodel").modal({
        backdrop: 'static'
    });
    /* id update */
    n = a.textlength;
    j = a.barcode;
    k = a.qarcode;
    d = a.lineDiv;
    h = a.boxDiv;
};

/* save */
const saveTemplate = document.getElementById("save");
const createFile = document.getElementById("createFileSureBut")
saveTemplate.onclick = function () {
    $("#createFileModal").modal("show");

    createFile.onclick = function () {
        var data = $("#fileName").val();
        console.log(data)
        /* html => img */
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
            localStorage.setItem(data, JSON.stringify(value));
            console.log('load ➡ over')
            location.reload();
        })

        $("#createFileModal").modal("hide");
    };
};

