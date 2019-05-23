package main

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/mux"
)

var net Network

func init() {

	net = CreateNetwork(784, 400, 10, 0.1)
	load(&net)

}

func main() {

	var port string
	port, isPresent := os.LookupEnv("PORT")
	if !isPresent {
		port = "8000"
	}

	router := mux.NewRouter()

	router.HandleFunc("/api/train", Train).Methods("GET")
	router.HandleFunc("/api/predict", Predict).Methods("POST")

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./build")))

	var gracefulStop = make(chan os.Signal)
	signal.Notify(gracefulStop, syscall.SIGTERM)
	signal.Notify(gracefulStop, syscall.SIGINT)
	go func() {
		sig := <-gracefulStop
		log.Printf("caught sig: %+v", sig)
		log.Println("Wait for 2 second to finish processing")
		os.Exit(0)
	}()

	log.Println("Starting  and listening on Port ", port)
	log.Fatal(http.ListenAndServe(":"+port, router))

}

// Train - Train network
func Train(w http.ResponseWriter, _ *http.Request) {

	go func() {
		net := CreateNetwork(784, 200, 10, 0.1)
		mnistTrain(&net)
		save(net)
		log.Println("Training Complete")
	}()

	log.Println("Training Started...")
	_ = json.NewEncoder(w).Encode("Training Started")

}

// Upload - image struct
type Upload struct {
	DataURI string
}

// Predict -  Predict network
func Predict(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	var t Upload
	err := decoder.Decode(&t)
	if err != nil {
		panic(err)
	}

	b64 := strings.Replace(t.DataURI, "data:image/png;base64,", "", 1)

	reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(b64))
	img, err := png.Decode(reader)

	if err != nil {
		panic(err)
	}

	// write the image
	outputFile, err := os.Create("test.png")
	if err != nil {
		// Handle error
	}

	// Encode takes a writer interface and an image interface
	// We pass it the File and the RGBA
	png.Encode(outputFile, img)

	// Don't forget to close files
	outputFile.Close()

	pngFile, _ := os.Open("test.png")
	pngImage, err := png.Decode(bufio.NewReader(pngFile))

	//net := CreateNetwork(784, 400, 10, 0.1)
	//load(&net)
	//	s := mnistPredict(&net)
	s := predictFromMemoryImage(net, pngImage)

	log.Println("Prediction:", s)
	_ = json.NewEncoder(w).Encode(s)

}

/*
func Run() {
	// 784 inputs - 28 x 28 pixels, each pixel is an input
	// 100 hidden nodes - an arbitrary number
	// 10 outputs - digits 0 to 9
	// 0.1 is the learning rate
	net := CreateNetwork(784, 200, 10, 0.1)

	mnist := flag.String("mnist", "", "Either train or predict to evaluate neural network")
	file := flag.String("file", "", "File name of 28 x 28 PNG file to evaluate")
	flag.Parse()

	// train or mass predict to determine the effectiveness of the trained network
	switch *mnist {
	case "train":
		mnistTrain(&net)
		save(net)
	case "predict":
		load(&net)
		mnistPredict(&net)
	default:
		// don't do anything
	}

	// predict individual digit images
	if *file != "" {
		// print the image out nicely on the terminal
		printImage(getImage(*file))
		// load the neural network from file
		load(&net)
		// predict which number it is
		fmt.Println("prediction:", predictFromImage(net, *file))
	}

}
*/

func mnistTrain(net *Network) {
	rand.Seed(time.Now().UTC().UnixNano())
	t1 := time.Now()

	for epochs := 0; epochs < 5; epochs++ {
		testFile, _ := os.Open("mnist_dataset/mnist_train.csv")
		r := csv.NewReader(bufio.NewReader(testFile))
		for {
			record, err := r.Read()
			if err == io.EOF {
				break
			}

			inputs := make([]float64, net.inputs)
			for i := range inputs {
				x, _ := strconv.ParseFloat(record[i], 64)
				inputs[i] = (x / 255.0 * 0.999) + 0.001
			}

			targets := make([]float64, 10)
			for i := range targets {
				targets[i] = 0.001
			}
			x, _ := strconv.Atoi(record[0])
			targets[x] = 0.999

			net.Train(inputs, targets)
		}
		testFile.Close()
	}
	elapsed := time.Since(t1)
	fmt.Printf("\nTime taken to train: %s\n", elapsed)
}

func mnistPredict(net *Network) string {
	t1 := time.Now()
	checkFile, _ := os.Open("mnist_dataset/mnist_test.csv")
	defer checkFile.Close()

	score := 0
	r := csv.NewReader(bufio.NewReader(checkFile))
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		inputs := make([]float64, net.inputs)
		for i := range inputs {
			if i == 0 {
				inputs[i] = 1.0
			}
			x, _ := strconv.ParseFloat(record[i], 64)
			inputs[i] = (x / 255.0 * 0.999) + 0.001
		}
		outputs := net.Predict(inputs)
		best := 0
		highest := 0.0
		for i := 0; i < net.outputs; i++ {
			if outputs.At(i, 0) > highest {
				best = i
				highest = outputs.At(i, 0)
			}
		}
		target, _ := strconv.Atoi(record[0])
		if best == target {
			score++
		}
	}

	elapsed := time.Since(t1)
	fmt.Printf("Time taken to check: %s\n", elapsed)
	fmt.Println("score:", score)
	result := strconv.Itoa(score)

	return result
}

// print out image on iTerm2; equivalent to imgcat on iTerm2
func printImage(img image.Image) {
	var buf bytes.Buffer
	png.Encode(&buf, img)
	imgBase64Str := base64.StdEncoding.EncodeToString(buf.Bytes())
	fmt.Printf("\x1b]1337;File=inline=1:%s\a\n", imgBase64Str)
}

// get the file as an image
func getImage(filePath string) image.Image {
	imgFile, err := os.Open(filePath)
	defer imgFile.Close()
	if err != nil {
		fmt.Println("Cannot read file:", err)
	}
	img, _, err := image.Decode(imgFile)
	if err != nil {
		fmt.Println("Cannot decode file:", err)
	}
	return img
}
