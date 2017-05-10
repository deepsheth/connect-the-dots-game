$(document).ready(function () {
    console.log("loaded");


    var color_scheme = [
        "#E03F3A",
        "#EADAB8",
        "#1A91A0",
        "#FFC83D",
        "#5566AC"
    ]

    var canvas = new fabric.Canvas('c');
    canvas.selection = false;
    var CANVAS_SIZE = 800;
    var grid = 80; // spacing between circles
    var linked_list = new DoublyList();

    var lockLine = false;
    var activeCircles = [];
    var currentCircle;

    // create grid
    for (var i = 0; i < 6; i++) {

        for (var n = 0; n < 6; n++) {
            var random_color = Math.floor(Math.random() * (color_scheme.length - 0)) + 0;
            var c_temp = new fabric.Circle({
                id: i * n,
                left: i * grid,
                top: n * grid,
                radius: 20,
                fill: color_scheme[random_color],
                strokeWidth: 5,
                stroke: 'rgba(0,0,0,0)',
                originX: 'left',
                originY: 'top',
                centeredRotation: true,
                selectable: false
            });

            canvas.add(c_temp);
        }

    }




    canvas
        .on('mouse:over', function (e) {
            e.target.setStroke('white');
            e.target.setStrokeWidth(5);

            // Line exists as soon as user begins dragging
            // Snaps line to a circle that is hovered over, this can only occur when the user is dragging so isDown needs to be true
            if (line) {

                if (e.target.getFill() == line.getStroke() && isDown) {

                    lockLine = true;
                    line.set({
                        x2: e.target.getCenterPoint().x,
                        y2: e.target.getCenterPoint().y
                    });
                    currentCircle = e.target;

                    // First if statement snaps/locks line with the same colored dot
                    // Diagonal lines are not allowed
                    if (line.x2 != line.x1 && line.y2 != line.y1) {
                        console.log("Diagonal lines are not allowed.");
                        lockLine = false;
                    }
                    // Lines can only be one unit long -- prevents line from streching across multiple dots
                    else if (Math.abs(line.x2 - line.x1) > grid || Math.abs(line.y2 - line.y1) > grid) {
                        console.log("Lines can only be one unit long");
                        lockLine = false;
                        line.remove();
                    } else {
                        lineExists = true;
                        totalLines++;

                        activeCircleCenter = e.target.getCenterPoint();
                        var points = [activeCircleCenter.x, activeCircleCenter.y, activeCircleCenter.x, activeCircleCenter.y];

                        allLines[totalLines] = new fabric.Line(points, {
                            strokeWidth: 12,
                            stroke: activeColor,
                            originX: 'center',
                            originY: 'center'
                        });

                        line = allLines[totalLines];
                        lockLine = false;
                        canvas.add(line);
                        linked_list.add(e.target.id);
                    }
                } else {
                    currentCircle = null;
                }
            }

            canvas.renderAll();
        })
        .on('mouse:out', function (e) {
            e.target.setStroke('rgba(0,0,0,0)');
            lockLine = false;
            canvas.renderAll();
        });


    // canvas.on('object:moving', function (options) {
    //     options.target.set({
    //         left: Math.round(options.target.left / grid) * grid,
    //         top: Math.round(options.target.top / grid) * grid
    //     });
    // });


    var line, isDown;
    var lineExists = false; // At least one line exists
    var totalLines = 0;

    var activeColor = "#000";

    fabric.Object.prototype.transparentCorners = false;

    var allLines = [];
    // for (var z = 0; z < 15; z++) {
    //     allLines[z] = new fabric.Line({
    //         strokeWidth: 12,
    //         stroke: activeColor,
    //         originX: 'center',
    //         originY: 'center'
    //     });
    // }

    canvas.on('mouse:down', function (o) {

        if (o.target.get('type') == "circle") {

            // If line color already exists, it cannot be changed.
            if (lineExists && activeColor != o.target.getFill()) {

                console.log("Color not not match existing.");
                line = null;
                return;
            } else {
                activeColor = o.target.getFill();
            }
            activeCircleCenter = o.target.getCenterPoint();

            isDown = true;

            var points = [activeCircleCenter.x, activeCircleCenter.y, activeCircleCenter.x, activeCircleCenter.y];

            allLines[totalLines] = new fabric.Line(points, {
                strokeWidth: 12,
                stroke: activeColor,
                originX: 'center',
                originY: 'center'
            });

            line = allLines[totalLines];

            canvas.add(line);

        }


    });

    canvas.on('mouse:move', function (o) {



        canvas.renderAll();
        if (!isDown) return;

        var pointer = canvas.getPointer(o.e);
        if (!lockLine) {

            allLines[totalLines].set({
                x2: pointer.x,
                y2: pointer.y
            });
        }

        canvas.renderAll();
    });

    canvas.on('mouse:up', function (o) {
        isDown = false;

        // If mouse/line is let go on top of empty canvas and not a circle, delete the line
        if (o.target === null) {
            line.remove();
        }

        // otherwise, the mouse/line was released on a circle, and we much error check the line
        else {
            console.log(line);
            // First if statement snaps/locks line with the same colored dot
            // Diagonal lines are not allowed
            if (line.x2 != line.x1 && line.y2 != line.y1) {
                console.log("Diagonal lines are not allowed.");
                line.remove();
            }
            // Lines can only be one unit long -- prevents line from streching across multiple dots
            else if (Math.abs(line.x2 - line.x1) > grid || Math.abs(line.y2 - line.y1) > grid) {
                console.log("Lines can only be one unit long");
                lockLine = false;
                line.remove();
            }
        }
    });

});


function Node(value) {
    this.id = value;
    this.previous = null;
    this.next = null;
}

function DoublyList() {
    this._length = 0;
    this.head = null;
    this.tail = null;
}

DoublyList.prototype.add = function (value) {
    var node = new Node(value);

    if (this._length) {
        this.tail.next = node;
        node.previous = this.tail;
        this.tail = node;
    } else {
        this.head = node;
        this.tail = node;
    }

    this._length++;

    console.log(node);

    return node;
};