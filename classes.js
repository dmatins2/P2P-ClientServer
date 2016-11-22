function drawText(context, x, y, size, color, text){
    context.font = size + "px Consolas";
    context.fillStyle = color;
    context.fillText(text, x, y);
}
// fileInfo is an array of objects that contain {color, proportion}
function drawFileBar(context, x, y, fileInfo){
    var currentY = y;
    var width = 5;
    var barSize = 50;
    var info;
    for (var i=0; i < fileInfo.length; i++) {
        info = fileInfo[i];
        var amountToFill = info.proportion * barSize;

        context.fillStyle = info.color;
        currentY = y + info.filePosition * barSize;
        context.fillRect(x, currentY, width, amountToFill);
    }
    context.fillStyle = "grey";
    context.strokeRect(x, y, width, barSize);
}

function adjustLink(link){
    var deltaX = link.destX - link.x,
        deltaY = link.destY - link.y,
        rad = - Math.atan2(deltaX,deltaY);;

    var dir = -8;

    link.x += dir*Math.cos(rad);
    link.destX += dir*Math.cos(rad);
    link.y += dir*Math.sin(rad);
    link.destY += dir*Math.sin(rad);

    return link;
}

function MyServer(x, y, type) {
    this.type = type;
    this.width = 60;
    this.height = 60;
    this.x = x;
    this.y = y;
    this.color = "orange";
    this.link;
    this.capturedPackets = [{color : this.color, proportion : 1.0, filePosition : 0.0}];
    this.updateLink = function(link){
        this.link = link;
    }
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/database.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);
    }
    this.sendPacket = function(dest, filePosition) {
        return new MyPacket(this.color, this.link, this.type, dest, 0.0, 0.01);
    }
}

function MyClient(color, x, y, type) {
    this.type = type;
    this.color = color;
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.link;
    this.capturedPackets = [];
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/Computer.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        if(this.type === "Client-4" || this.type === "Client-5")
            drawFileBar(context, this.x + this.width + 8, this.y - 8, this.capturedPackets);
        else 
            drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);

        context.fillStyle = this.color;
        context.fillRect(this.x + this.width/2 - 5, this.y + this.height, 10, 10);
    }
    this.updateLink = function(link){
        this.link = link;
    }
    this.detectCollision = function(obj) {
        if(obj == null || obj.from === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                var newPacket = true;
                var info;
                for (var i=0; i < this.capturedPackets.length; i++) {
                    info = this.capturedPackets[i];
                    if(info.color === obj.color){
                        info.proportion += obj.packetSize;
                        newPacket = false;
                    }
                }
                if(newPacket){
                    info = {};
                    info.color = obj.color;
                    info.proportion = obj.packetSize;
                    info.filePosition = obj.filePosition;
                    this.capturedPackets.push(info);
                }
                return true;
            }
        }
    }
}

function MyP2PServer(x, y, type, fileInfo) {
    this.type = type;
    this.width = 60;
    this.height = 60;
    this.x = x;
    this.y = y;
    this.color = "orange";
    this.link;
    this.capturedPackets = [{color : this.color, proportion : 1.0, filePosition : 0.0}];
    this.fileInfo = fileInfo;
    this.updateLink = function(link){
        this.link = link;
    }
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/database.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);
    }
    this.sendPacket = function(dest) {
        return new MyPacket(this.color, this.link, this.type, dest, this.fileInfo[dest].filePosition, this.fileInfo[dest].filePercentage/10);
    }
}

function MyP2PClient(color, x, y, type) {
    this.type = type;
    this.color = color;
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.link;
    this.packetBuffer = [];
    this.capturedPackets = [];
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/Computer.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        if(this.type === "Client-4" || this.type === "Client-5")
            drawFileBar(context, this.x + this.width + 8, this.y - 8, this.capturedPackets);
        else 
            drawFileBar(context, this.x - 8, this.y - 8, this.capturedPackets);

        drawText(context, this.x, this.y - 4, 13, "black", this.type);

        context.fillStyle = this.color;
        context.fillRect(this.x + this.width/2 - 5, this.y + this.height, 10, 10);
    }
    this.updateLink = function(link){
        this.link = link;
    }
    this.sendPacket = function(dest) {
        return new MyPacket(this.color, this.link, this.type, dest, this.packetBuffer[0].filePosition, this.packetBuffer[0].packetSize);
    }
    this.detectCollision = function(obj) {
        if(obj == null || obj.from === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                var newPacket = true;
                var info;
                for (var i=0; i < this.capturedPackets.length; i++) {
                    info = this.capturedPackets[i];
                    if(info.color === obj.color){
                        info.proportion += obj.packetSize;
                        newPacket = false;
                    }
                }
                if(newPacket){
                    info = {};
                    info.color = obj.color;
                    info.proportion = obj.packetSize;
                    info.filePosition = obj.filePosition;
                    this.capturedPackets.push(info);
                }
                if(obj.originallyFrom === "Server"){
                    info = {};
                    info.filePosition = obj.filePosition;
                    info.packetSize = obj.packetSize;
                    this.packetBuffer.push(info);
                }
                return true;
            }
        }
    }
}

function MyRouterNet(x, y) {
    this.type = "router";
    this.width = 60;
    this.height = 50;
    this.x = x;
    this.y = y;
    this.packetBuffer = [];
    this.links = [];
    this.updateLinks = function(links){
        for(var l in links)
            this.links[l] = adjustLink(new MyLink(links[l].x, links[l].y, links[l].destX, links[l].destY));
    }
    this.draw = function(context) {
        var imageObj = new Image();
        imageObj.onload = function() {
        };
        imageObj.src = './images/router.png';
        context.drawImage(imageObj, this.x, this.y, this.width, this.height);

        drawText(context, this.x - 5, this.y - 4, 13, "black", "Router Network");
    }
    this.route = function(obj) {
        if(obj == null || obj.from === this.type)
            return false;
        if((this.x <= obj.x && obj.x <= this.x + this.width) || (this.x >= obj.x && this.x <= obj.x + obj.width)){
            if((this.y <= obj.y && obj.y <= this.y + this.height) || (this.y >= obj.y && this.y <= obj.y + obj.height)){
                var link = this.links[obj.dest];
                var packet = new MyPacket(obj.color, link, this.type, obj.dest, obj.filePosition, obj.packetSize);
                packet.originallyFrom = obj.from;
                this.packetBuffer.push(packet);
                return true;
            }
        }
    }
}

function MyPacket(color, link, from, dest, filePosition, packetSize) {
    this.dest = dest;
    this.from = from;
    this.originallyFrom = from;
    this.packetSize = packetSize;
    this.filePosition = filePosition;
    this.color = color;
    this.width = 5;
    this.height = 5;
    this.x = link.x;
    this.y = link.y;
    this.destX = link.destX;
    this.destY = link.destY;
    this.draw = function(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    this.updatePosition = function() {
        var deltaX = this.destX - this.x,
        deltaY = this.destY - this.y,
        rad = Math.atan2(deltaY,deltaX);;

        this.x += Math.cos(rad);
        this.y += Math.sin(rad);
    }
}

function MyLink(x, y, destX, destY) {
    this.x = x;
    this.y = y;
    this.destX = destX;
    this.destY = destY;
    this.draw = function(context) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.destX, this.destY);
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.stroke();
    }
}
