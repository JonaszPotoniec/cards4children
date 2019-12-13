import React from 'react';
import './App.css';
import htmlToImage from 'html-to-image';

class App extends React.Component  {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      numberOfImages: 1,
      combinations: []
    }

    this.loadFile = this.loadFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.changeNumber = this.changeNumber.bind(this);
    this.calculateCombinations = this.calculateCombinations.bind(this);
  }

  loadFile(event){
    this.setState({
      files: this.state.files.concat(URL.createObjectURL(event.target.files[0]))
    }, this.calculateCombinations)
  }

  calculateCombinations(){
    this.setState({
      combinations: this.combinations(this.state.files, this.state.numberOfImages)
    })
  }

  combinations(set, k) {
    var i, j, combs, head, tailcombs;
    if (k > set.length || k <= 0) {
        return [];
    }
    if (k === set.length) {
        return [set];
    }
    if (k === 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        head = set.slice(i, i+1);
        tailcombs = this.combinations(set.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
  }

  removeFile(i){
    let temp = this.state.files;
    temp.splice(i, 1);

    this.setState({
      files: temp
    })
  }

  changeNumber(x){
    this.setState({
      numberOfImages: x.target.value
    }, this.calculateCombinations)
  }

  render() {
    return (
      <div className="App">
        <Configuration
          images={this.state.files}
          loadFile={this.loadFile}
          removeFile={this.removeFile}
          changeNumber={this.changeNumber}
          numberOfImages={this.state.numberOfImages}
        />
        <Preview
          combinations={this.state.combinations}
          numberOfImages={this.state.numberOfImages}
        />
      </div>
    );
  }
}

class Configuration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    }
    this.convertToPng = this.convertToPng.bind(this);
    this.convertToAllPng = this.convertToAllPng.bind(this);
  }

  convertToPng(){
    var node = document.getElementById('Preview');

    htmlToImage.toPng(node)
      .then((dataUrl) => {
        var link = document.createElement('a');
        link.download = 'obrazki.png';
        link.href = dataUrl;
        link.click();
      });
  }

  convertToAllPng(){
    Array.from(document.getElementById('Preview').children).map((node, i) => {
      htmlToImage.toPng(node)
        .then((dataUrl) => {
          var link = document.createElement('a');
          link.download = 'image-'+(i+1)+'.png';
          link.href = dataUrl;
          link.click();
        });
    })
  }

  render() {
    return (
      <div id="ConfigurationMenu">
        <div>
          <div>
            <input type="file" onChange={this.props.loadFile}/>
          </div>
        </div>
        <div>
          Liczba obrazków: <input type="number" min={1} value={this.props.numberOfImages} onChange={this.props.changeNumber}/>
        </div>
        <div id="ImagePreview">
          {
            this.props.images.map((e, i) => {
              return (
                <div key={i}>
                  <button onClick={() => this.props.removeFile(i)}>X</button>
                  <img src={e} alt={"Photo number "+i} />
                </div>
              )
            })
          }
        </div>
        <div>
          <button onClick={this.convertToPng} className="menuButton">Pobierz razem</button>
          <button onClick={this.convertToAllPng} className="menuButton">Pobierz oddzielnie</button>
        </div>
      </div>
    );
  }
}

class Preview extends React.Component {

  render() {

    return (
      <div id="Preview">
        {
          this.props.combinations.map((combination, index) => {
            return <div key={index} className="card" style={{
                gridTemplateColumns: "repeat("+Math.ceil(Math.sqrt(this.props.numberOfImages))+", auto)",
                gridTemplateRows: "repeat("+Math.ceil(Math.sqrt(this.props.numberOfImages))+", auto)"
              }}>
              {
                combination.map((links, linkIndex) => {
                  return <img src={links} key={linkIndex} alt="links" style={{transform: "rotate("+Math.ceil(Math.random()*360)+"deg)"}}/>
                })
              }
            </div>
          })
        }
      </div>
    )
  }
}

export default App;
