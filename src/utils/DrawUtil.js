

class DrawUtil {

    static drawLine(canvas, startPoint, endPoint, color, thickness) {
        let ctx = canvas.getContext('2d');
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x + 1, endPoint.y + 1);
        ctx.stroke();
        ctx.restore();
    }


    static getImageDataAndScale(canvas, outputSize) {


        // step 1 - resize to 50%
        var oc = document.createElement('canvas');
        var octx = oc.getContext('2d');

        oc.width = canvas.width * 0.5;
        oc.height = canvas.height * 0.5;
        octx.drawImage(canvas, 0, 0, oc.width, oc.height);

        var oc2 = document.createElement('canvas');
        oc2.width = oc.width * 0.5;
        oc2.height = oc.height * 0.5;

        var octx2 = oc2.getContext('2d');

        // step 2
        octx2.drawImage(oc, 0, 0, oc2.width, oc2.height);

        // step 3, resize to final size
        var oc3 = document.createElement('canvas');
        oc3.width = oc2.width * 0.50;
        oc3.height = oc2.height * 0.50;
        var octx3 = oc3.getContext('2d');
        octx3.fillStyle = "#FFF";
        octx3.fillRect(0, 0, oc3.width, oc3.height);

        //octx3.drawImage(oc2, 0, 0, outputSize, outputSize);

        // octx3.drawImage(canvas, 0, 0, canvas.width, canvas.height,0,0,outputSize,outputSize);

        octx3.drawImage(oc2, 0, 0, oc2.width * 0.50, oc2.height * 0.50);

        var oc4 = document.createElement('canvas');
        oc4.width = 20;
        oc4.height = 20;
        var octx4 = oc4.getContext('2d');

        octx4.drawImage(oc3, 0, 0, 20, 20);


        var oc5 = document.createElement('canvas');
        oc5.width = outputSize;
        oc5.height = outputSize;
        var octx5 = oc5.getContext('2d');
        octx5.fillStyle = "#FFF";
        octx5.fillRect(0, 0, outputSize, outputSize);
        octx5.drawImage(oc4, 0, 0, outputSize, outputSize);

        octx5.strokeStyle = "#000";
        octx5.lineWidth = 1;
        octx5.strokeRect(0, 0, oc5.width, oc5.height);




        return oc5.toDataURL();
    }


    static downsize(canvas, outputSize) {

        var ctx = canvas.getContext("2d");
        var img = new Image();
        img.height = canvas.height;
        img.width = canvas.width;

        // set size proportional to image
        //canvas.height = canvas.width * (img.height / img.width);

        // step 1 - resize to 50%
        var oc = document.createElement('canvas'),
            octx = oc.getContext('2d');

        oc.width = img.width * 0.5;
        oc.height = img.height * 0.5;
        octx.drawImage(img, 0, 0, oc.width, oc.height);

        // step 2
        octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

        // step 3, resize to final size
        ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
            0, 0, canvas.width, canvas.height);

    }

}


export default DrawUtil
