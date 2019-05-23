import React, {Component} from 'react'
import DrawUtil from '../utils/DrawUtil.js'
import api from '../utils/api.js'

const MNIST_MODEL_INPUT_PIXEL_SIZE = 28;
const MNIST_DRAWING_BOARD_BASE_DIM = 400;   
const MNIST_DRAWING_BOARD_BASE_TEXT_SIZE = 40;
const MNIST_DRAWING_BOARD_BASE_BRUSH_DIAMETER = 40;  //40
const MNIST_DRAWING_BOARD_BASE_BRUSH_COLOR = "#000";


class MainView extends Component {
    constructor(props) {
        super(props);

        this.previousMousePosition = null;
        this.mousePosition = null;
        this.isDrawing = false;
        this.drawingBoardScale = 1;
        this.state = {prediction: null};
       
     
    }

    uploadImage = async (dataUrl) => {

        const body = {
            DataURI: dataUrl
        };

        const {data} = await api.post('predict', body);

        this.setState({prediction: data});
     

    }



    dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
  }


    scale = (e) => {

       let dataUrl = DrawUtil.getImageDataAndScale(this.canvas,28)

        this.uploadImage(dataUrl)

    }


    componentDidMount() {

        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
       
       // window.addEventListener("resize", this.setUpCanvas);
        window.addEventListener("mouseup", this.handleDrawEnd);
        window.addEventListener("touchend", this.handleDrawEnd);
    }

    componentDidUpdate() {
        //this.setUpCanvas();
       

    }

    componentWillUnmount() {
       // this.props.onNewPrediction([]);
       // window.removeEventListener("resize", this.setUpCanvas);
        window.removeEventListener("mouseup", this.handleDrawEnd);
        window.removeEventListener("touchend", this.handleDrawEnd);
    }

    clear = (event) => {

      let ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.isDrawing = false;
      this.setState({prediction: null});
     


    }

    updateMousePosition (newMousePosition) {
        this.previousMousePosition = this.previousMousePosition ? this.mousePosition : newMousePosition;
        this.mousePosition = newMousePosition;
    }


    handleDrawStart = (event) => {
        this.isDrawing = true;
        this.handleMouseMove(event);
       
    };

     handleDrawEnd = () => {
        this.isDrawing = false;
        this.previousMousePosition = null;
    };

    handleMouseMove = (event) => {
        const clientMousePosition = this.clientCoordinatesFromEvent(event);
        event.preventDefault();
        event.stopPropagation();
        if (clientMousePosition && !!this.canvas) {
            const canvasRect = this.canvas.getBoundingClientRect();
            const newPosition = {
                x: clientMousePosition.x - canvasRect.left,
                y: clientMousePosition.y - canvasRect.top
            };
            this.updateMousePosition(newPosition);
        }
        if (this.isDrawing) {
            this.draw();
            setTimeout(this.scale(event), 0);
        }
    };

   draw() {
        const brushDiameter = this.drawingBoardScale * MNIST_DRAWING_BOARD_BASE_BRUSH_DIAMETER;
        const brushColor = MNIST_DRAWING_BOARD_BASE_BRUSH_COLOR;
        DrawUtil.drawLine(this.canvas, this.previousMousePosition, this.mousePosition, brushColor, brushDiameter);
    }


    clientCoordinatesFromEvent(event) {
        if ("clientX" in event)
            return {x: event.clientX, y: event.clientY};
        else if (typeof event.touches !== "undefined" && event.touches.length)
            return {x: event.touches[0].clientX, y: event.touches[0].clientY};
        else
            return null;
    }

 render() {

    let Prediction = <span> </span>;

    if (this.state.prediction != null) {
        Prediction = <span>{this.state.prediction}</span>;
    }

    return (

   <div className="container">     


    <div className="row">
        <div className="col-md-6">
          
            
             <div ref = {ref => this.boardWrapper = ref}>
                    <canvas  width={MNIST_DRAWING_BOARD_BASE_DIM} height={MNIST_DRAWING_BOARD_BASE_DIM} ref = {ref => this.canvas = ref}
                        onMouseMove={this.handleMouseMove}
                        onMouseDown={this.handleDrawStart}
                        onTouchStart={this.handleDrawStart}
                        onTouchMove={this.handleMouseMove}
                    />
            </div>

            <button onClick={this.clear}>Clear</button>

        </div>

    <div className="col-md-6">
            
           Prediction

            <div style={{fontSize: "200px"}}>{Prediction}</div>

    </div>
  </div>
     <div className="row">
         <div className="col-md-12"> &nbsp; </div>
         <div className="col-md-12"> <p className="text-center font-weight-light">Keep trying, this is a slow simple Perceptron Neural Net </p>       </div>  
    </div>   

 </div>)

 }    
}


 export default MainView