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

    
    // create grid
    for (var i = 0; i < 6; i++) {

        for (var n = 0; n < 6; n++) {
            var random_color = Math.floor(Math.random() * (color_scheme.length - 0)) + 0;
            var c_temp = new fabric.Circle({
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


    var intersected = false;
    var activeCircles = [];
    var currentCircle;

    canvas
        .on('mouse:over', function (e) {
            e.target.setStroke('white');
            e.target.setStrokeWidth(5);

            // Line exists as soon as user begins dragging
            // Snaps line to a circle that is hovered over, this can only occur when the user is dragging so isDown needs to be true
            if (line) {
                if (e.target.getFill() == line.getStroke() && isDown) {
                    intersected = true;
                    line.set({
                        x2: e.target.getCenterPoint().x,
                        y2: e.target.getCenterPoint().y
                    });
                    currentCircle = e.target;
                }
                else {
                    currentCircle = null;
                }
            }

            canvas.renderAll();
        })
        .on('mouse:out', function (e) {
            e.target.setStroke('rgba(0,0,0,0)');
            intersected = false;
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

    var activeColor;

    fabric.Object.prototype.transparentCorners = false;

    canvas.on('mouse:down', function (o) {

        if (o.target.get('type') == "circle") {
            
            // If line color already exists, it cannot be changed.
            if (lineExists && activeColor != o.target.getFill()) {

                console.log("Color not not match existing.");
                line = null;
                return;
            }
            else {
                activeColor = o.target.getFill();
            }
            activeCircleCenter = o.target.getCenterPoint();

            isDown = true;

            var points = [activeCircleCenter.x, activeCircleCenter.y, activeCircleCenter.x, activeCircleCenter.y];

            line = new fabric.Line(points, {
                strokeWidth: 12,
                stroke: activeColor,
                originX: 'center',
                originY: 'center'
            });
            canvas.add(line);

        }


    });

    canvas.on('mouse:move', function (o) {



        canvas.renderAll();
        if (!isDown) return;

        var pointer = canvas.getPointer(o.e);
        if (!intersected) {
            line.set({
                x2: pointer.x,
                y2: pointer.y
            });
        }

        canvas.renderAll();
    });

    canvas.on('mouse:up', function (o) {
        var pointer = canvas.getPointer(o.e);

        // If line does not intersect with circle, it cannot be placed at random canvas location.
        // Must snap to circle 
        if (intersected == false ) {
            line.remove();
        }
        // Diagonal lines are not allowed
        else if (line.x2 != line.x1 && line.y2 != line.y1) {
            line.remove();
        }
        // Lines can only be one unit long -- prevents line from streching across multiple dots
        else if ( Math.abs(line.x2 - line.x1) > grid || Math.abs(line.y2 - line.y1) > grid) {
            line.remove();
        }
        else {
            lineExists = true;
            if (currentCircle){
                activeCircles.push(currentCircle);
                console.log("New circle added!");
            }
        }

        isDown = false;

    });


});