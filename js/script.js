//     DEEP SHETH 
//     DSS218
//     CSE 264 FINAL PROJECT
//     5/13/2017
//     PUZZLE GAME: DOTS

var color_scheme = [
    "#E03F3A",
    "#EADAB8",
    "#1A91A0",
    "#5566AC"
]; // dot colors

var CANVAS_SIZE = 600; // defined in css
var grid = 60; // spacing between circles
var CIRCLES_PER_ROW = 6; // rows & columns
var linked_list = new DoublyList(); // linked list of selected dots
var lockLine = false; // if line should be snapped to a dot
var currentCircle; // current circle that was hovered over

var line; // current line being moved around
var isDown; // if the mouse is down (dragging line)
var lineExists = false; // At least one line exists
var totalLines = 0; // total number of lines connecting dots
var activeColor = "#000"; // color of active line
var allLines = []; // array of all drawn lines
var gameOver = false;

$(document).ready(function () {

    initModal();

    var canvas = new fabric.Canvas('c');
    canvas.selection = false;
    fabric.Object.prototype.transparentCorners = false;

    // create grid
    for (var i = 0; i < CIRCLES_PER_ROW; i++) {

        for (var n = 0; n < CIRCLES_PER_ROW; n++) {
            var random_color = Math.floor(Math.random() * (color_scheme.length - 0)) + 0;
            var circ = new fabric.Circle({
                id: (i * CIRCLES_PER_ROW) + n,
                in: false,
                out: false,
                left: n * grid,
                top: i * grid,
                radius: 15,
                fill: color_scheme[random_color],
                strokeWidth: 5,
                stroke: 'rgba(0,0,0,0)',
                originX: 'left',
                originY: 'top',
                centeredRotation: true,
                selectable: false
            });

            canvas.add(circ);
        }

    }


    canvas
        .on('mouse:over', function (e) {
            e.target.setStroke('white');
            e.target.setStrokeWidth(5);

            // Line exists as soon as user begins dragging
            // Snaps line to a circle that is hovered over, this can only occur when the user is dragging so isDown needs to be true
            if (line && !gameOver) {

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
                        // line.remove();

                        // Each circle may only have 1 line connecting into it
                    } else if (e.target.in) {
                        console.log("Circle already has an input");
                        lockLine = false;
                    }

                    // You cannot connect the current circle from the previous circle where the line just came from
                    else if (e.target.id == linked_list.tail.id) {
                        console.log("Cannot move backwards.");
                        lockLine = false;
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

                        e.target.in = true;

                        line = allLines[totalLines];
                        lockLine = false;
                        canvas.add(line);
                        linked_list.add(e.target.id);
                        console.log(linked_list);
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



    // Primarily used for first down
    canvas.on('mouse:down', function (o) {

        if (o.target.get('type') == "circle") {

            // If line color already exists, it cannot be changed.
            if (lineExists && activeColor != o.target.getFill()) {
                console.log("Color not not match existing.");
                line = null;
                return;
            } else {
                activeColor = o.target.getFill();
                // Add first, starting circle to list (line does not exist at this point)
                linked_list.add(o.target.id);
                o.target.out = true;
                console.log(linked_list);
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



        // var activeDotsColumns = getColumnsToAddDotsTo(linked_list, CIRCLES_PER_ROW);
        // console.log(activeDotsColumns);
        // var dotsToAddPerColumn = shiftDotsDown(activeDotsColumns);
        // console.log(dotsToAddPerColumn);
        var coordsToGenerateDots = removeSelectedDots(canvas);
        addNewDots(coordsToGenerateDots, canvas);
        console.log(coordsToGenerateDots);




    });


    // Timer and Score Calculator
    setInterval(function () {
        var timeLeft = parseInt($('.dyn-time').text());
        timeLeft = timeLeft - 1;

        if (timeLeft == 5) {
            $('.dyn-time').addClass("blink");
        }
        if (timeLeft <= 0) {
            $('.dyn-time').text("0");
            $('.dyn-alert').text("Game Over!");
            $('.dyn-alert').addClass("blink");
            $('.dyn-time').removeClass("blink");
            $('.reveal').addClass("show");
            gameOver = true;
        } else {
            $('.dyn-time').text(timeLeft);
        }

    }, 1000);

});

function initModal() {
    // Get the modal
    var modal = document.getElementById('myModal');

    // Get the button that opens the modal
    var btn = document.getElementById("btnHelp");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function shiftDotsDown(activeDotsColumns) {
    var numDupsFound = 0;
    var numToFindDuplicatesOf;
    var dotsToAddPerColumn = [];

    for (var i = 0; i < activeDotsColumns.length - 1; i++) {
        if (activeDotsColumns[i + 1] == activeDotsColumns[i]) {
            dotsToAddPerColumn.push(activeDotsColumns[i]);
        }
    }

    return dotsToAddPerColumn;
}

function addNewDots(coordsToGenerateDots, canvas) {
    for (var i = 0; i < coordsToGenerateDots.length; i++) {

        var random_color = Math.floor(Math.random() * (color_scheme.length - 0)) + 0;

        var circ = new fabric.Circle({
            id: coordsToGenerateDots[i].id,
            in: false,
            out: false,
            left: coordsToGenerateDots[i].x,
            top: coordsToGenerateDots[i].y - 20,
            radius: 15,
            fill: color_scheme[random_color],
            opacity: 0,
            strokeWidth: 5,
            stroke: 'rgba(0,0,0,0)',
            originX: 'left',
            originY: 'top',
            centeredRotation: true,
            selectable: false
        });
        canvas.add(circ);

        circ.animate({
            'opacity': '1',
            'top': circ.top + 20
        }, {
            duration: 950,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function () {

            },
            easing: fabric.util.ease["easeOutElastic"]
        });
    }

}

function getColumnsToAddDotsTo() {
    var currentNode = linked_list.head;
    var columnsToAddDots = [];

    for (var i = 0; i < linked_list._length; i++) {

        console.log(currentNode.id);
        columnsToAddDots[i] = (currentNode.id % CIRCLES_PER_ROW);
        currentNode = currentNode.next;
    }

    // Returns sorted list of columns to add dots to
    return columnsToAddDots.sort();
}

function removeSelectedDots(canvas) {
    var coordsToGenerateDots = [];

    // Remove selected dots
    canvas.forEachObject(function (obj) {
        if (linked_list._length <= 1) return;

        if (obj.get('type') == "line") {
            obj.animate('opacity', '0', {
                duration: 75,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: function () {
                    canvas.remove(obj);
                }
            });
            return;
        }

        var currentNode = linked_list.head;

        for (var i = 0; i < linked_list._length; i++) {
            if (currentNode.id == obj.id) {

                coordsToGenerateDots.push({
                    "x": obj.left,
                    "y": obj.top,
                    "id": obj.id
                });

                obj.animate('opacity', '0', {
                    duration: 75,
                    onChange: canvas.renderAll.bind(canvas),
                    onComplete: function () {
                        canvas.remove(obj);

                    }
                });
            }

            currentNode = currentNode.next;
        }
    });

    if (linked_list._length > 1 && !gameOver) updateScore(linked_list._length);
    lineExists = false;
    linked_list = new DoublyList();
    return coordsToGenerateDots;
}

function updateScore(num_circles) {
    var selection_score = Math.round(Math.exp(num_circles / 1.2) / 2);

    var totalScore = parseInt($('.dyn-score').text());
    totalScore += selection_score;
    $('.dyn-score').text(totalScore);

}

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

    return node;
};

function releadPage() {
    location.reload();
}