# Keyhole Software Neural Net Reference Application
Simple Neural Net implementation, Taken from the MNIST Nueral Net example implementation. 

UI is implemented in `ReactJS` and server side API/Nueral Net is implemented in `GO` 

Online DEMO can be accessed [HERE](https://khs-neural-net.herokuapp.com)

![](https://github.com/in-the-keyhole/khs-neural-net/blob/master/images/neural-net.png)


# Installing Running 

1. Install Go and Node.js
2. Clone Repo in Go 'SRC' directory 
3. Open console in cloned repo directory and perform these commands 

```
 $ npm install
 $ npm run build       // Builds React Bundle 
 $ go build            // Build API server and web server
 $ ./khs-neural-net    // Executes Go Binary
```

4. Open browser to http://localhost:8000

# Training Network

Network has been pre trained, but it can be retrained with the following commands

1. Unzip mnist_dataset
2. From a command shell execute the following commands

```
$ go build
$ ./khs-neural-net -mnist train
```

# References 

References used in this implementation

* Modified Go implementation from [https://github.com/sausheong/gonn/commits/master](https://github.com/sausheong/gonn/commits/master)

* YOLO and MNIST reference app [https://github.com/SkalskiP/ILearnMachineLearning.js](https://github.com/SkalskiP/ILearnMachineLearning.js)

