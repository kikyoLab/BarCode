"use strict";
// 标签绑定字段数据
const dataFiled = (function () {
    let result;
    $.ajax({
        type: 'POST',
        url: "http://test.ecsun.cn:99/mzato/main/labels/set",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ "vtype": "getdatafield" }),
        async: false,
        success: function (data) {
            if (data.Table[0].result == 'success') {
                result = data.Table
            } else {
                return (console.error(`绑定数据接口故障:${data.Table[0].result}`))
            }
        }
    })
    return result
})();

// bootstrap-table设置
(function () {
    if (!dataFiled) return (console.error(`绑定数据接口故障,请联系管理人员`))
    // 富文本数据绑定下拉栏
    let data = dataFiled.filter(x => x.datafieldid !== 'dysl' && x.datafieldid !== 'recordid')
    for (var i = 0; i < data.length; i++) {
        $("#databind").append(`<option>${data[i].datafieldname}</option>`)
    }

    $('#databind').editableSelect({ filter: false });
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

            // 获取该元素自定义属性
            let target = document.getElementById('' + eleId)
            console.log(target.dataset.text)
            if (target.dataset.text) {
                let targets = dataFiled.filter((x) => x.datafieldid == target.dataset.text)[0].datafieldname
                $("#databind").val(targets)
            }
            // 获取 x y 坐标值
            let left = $("#" + eleId).css('left').slice(0, $("#" + eleId).css('left').length - 2)
            let top = $("#" + eleId).css('top').slice(0, $("#" + eleId).css('top').length - 2)
            $("#textXvalue").val(left)
            $("#textYvalue").val(top)

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
};

// 确定生成
BarCodeFormOk.onclick = function () {
    $("#printmain").append(
        `<div id=${"Code" + j} style="position: fixed; margin: 0;display：inline; overflow: hidden;z-index:2" class="BarCodedbclick refbox">
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

// 二维码生成
QarCodeFormok.onclick = function () {
    $("#printmain").append(`<div id=${
        "QrCode" + k} style="position: fixed; margin: 0; overflow: hidden;display：inline;z-index:2" class="QarCodedbclick refbox">
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
            '<div style="position: fixed; margin: 0; overflow: hidden;display：inline;z-index:2" id="loadImg"><img style = "max-width:100%;max-height:100%; class="preview" src="' +
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
    // x y 坐标赋值
    let Xvalue = $("#textXvalue").val() + 'px'
    let Yvalue = $("#textYvalue").val() + 'px'
    $("#" + eleId).css('left', Xvalue)
    $("#" + eleId).css('top', Yvalue)
    $("#" + eleId).html(um.getContent());

    /* 新增属性-绑定数据 ID */
    if ($("#databind").val()) {
        let val = dataFiled.filter((x) => x.datafieldname == $("#databind").val())[0].datafieldid
        $("#" + eleId).attr('data-text', val)
    }

    $("#databind").val('')
    $("#exampleModalCenter").modal("hide");
});


/**
 * 文本事件
 * @param {number} n 文本ID
 */
const addText = document.getElementById("textBtn");
const Print = document.getElementById("print");
const printOk = document.getElementById('printOk')
const printNo = document.getElementById('printNo')
let n = 0;
addText.onclick = function () {
    $("#printmain")
        .append(`<div style="position: fixed; margin: 0;overflow: hidden;display：inline;z-index:2" class='editable refbox'
             id=${"text" + n}><p contenteditable="true" style="height:100%">Text</p></div>`);

    drag(document.getElementById("text" + n), { minSize: 40 });
    $("#text" + n).click()
    n++;
    allNum++;
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

// 模板打印
Print.onclick = function () {
    $("#printmodal").modal()
    printOk.onclick = function () {
        let labId = $("#tmplId").val()
        let roomName = $("#Name").val()
        location.href = "print.html?id=" + labId + '&roomName=' + roomName;
    }
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
            <div style="margin-left: -10px;;font-size:14px;">${allTmpl[i].templateid}</div>
                <span style="margin-left: -10px;;font-size:14px;">${allTmpl[i].templatename}</span>
                <div class="buttonGroup" style="text-align: right;margin-top: -25px;">
                    <button type="button" class="btn btn-sm btn-primary" id="${i}">选择</button>
                    <button type="button" class="btn btn-sm btn-danger" id="del${i}">删除</button>
                </div>
            </div>
        </div>
    </div>`);

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
            data.allNum = data.textlength + data.barcode + data.qarcode
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

// 模板保存
const saveTemplate = document.getElementById("save");
const createFile = document.getElementById("createFileSureBut")
saveTemplate.onclick = function () {
    $("#createFileModal").modal("show");

    createFile.onclick = function () {
        var names = $("#fileName").val();
        var id = $("#fileId").val()
        // 将当前模板框内元素html保存，并生成预览图
        let width = $("#demo").width()
        let height = $("#demo").height()
        $("#printmain").width(width)
        $("#printmain").height(height)
        html2canvas(document.getElementById("printmain")).then(function (canvas) {
            let imgUrl = canvas.toDataURL("image/png");
            let value = {
                code: $("#printmain").html(),
                img: imgUrl,
                allNum: allNum,
                textlength: n,
                barcode: j,
                qarcode: k,
                lineDiv: d,
                boxDiv: h,
            };

            let sVal = htmlEncode(JSON.stringify(value).replace(/[\r\n]/g, ""))
            $.ajax({
                type: 'POST',
                url: 'http://test.ecsun.cn:99/mzato/main/labels/set',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    "vtype": "addtemplate", "item1": id, "item2": names,
                    "item3": sVal, "item4": "测试模板"
                }),
                async: false,
                success: function (data) {
                    if (data.Table[0].result == 'success') {
                        location.reload();
                    } else {
                        return (console.error(`模板保存接口故障:${data.Table[0].result}`))
                    }
                }
            })
        })
        $("#createFileModal").modal("hide");
    };
};