import React from 'react';
import './App.css';
import htmlToImage from 'html-to-image';

class App extends React.Component  {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      numberOfImages: 1,
      combinations: [],
      settings: {
        "gap": 2,
        doodle: false
      }
    }

    this.setSettings = this.setSettings.bind(this);
    this.loadFile = this.loadFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.changeNumber = this.changeNumber.bind(this);
    this.calculateCombinations = this.calculateCombinations.bind(this);
  }

  setSettings(setting,event){ console.log(event.target.checked);
    let temp = this.state.settings;
    if(event.target.value === "false")
        temp[setting] = event.target.checked;
    else
        temp[setting] = event.target.value;
    this.setState({
      settings: temp
    })
  }

  loadFile(event){
    this.setState({
      files: this.state.files.concat(URL.createObjectURL(event.target.files[0]))
    }, this.calculateCombinations)
  }

  calculateCombinations(){
    if(this.state.settings.doodle == true && this.isPrime(this.state.numberOfImages - 1)){
        this.setState({
            combinations: (this.DobbleCards(this.state.numberOfImages)).map((e) => {return e.map((x, i) => {return this.state.files[x % this.state.files.length]})})
        })
    } else
        this.setState({
        combinations: this.combinations(this.state.files, this.state.numberOfImages)
        })
  }
  
    isPrime(num) {
        for(var i = 2; i < num; i++)
            if(num % i === 0) return false;
        return num > 1;
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
  
//function from https://stackoverflow.com/questions/52822827/spot-it-algorithm-js
  DobbleCards(n) { // n-1 must be prime
        var cards = [];

        // first card and first category
        for (var crd = 0; crd < n; crd++) {
            var symbols = [0];
            for (var sym = 1; sym < n; sym++) {
                symbols.push(crd * (n-1) + sym);
            }
            cards.push(symbols.slice());
        }

        // other categories
        for (var cat = 1; cat < n; cat++) {
            for (var crd = 0; crd < n-1; crd++) {
                var symbols = [cat];
                for (var sym = 1; sym < n; sym++) {
                    symbols.push(1 + sym * (n-1) + ((cat-1) * (sym-1) + crd) % (n-1));
                }
                cards.push(symbols.slice());
            }
        }
    console.log(cards);
        return cards;
    }
//#####################
    
  removeFile(i){
    let temp = this.state.files;
    temp.splice(i, 1);

    this.setState({
      files: temp
    }, this.calculateCombinations)
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
          setSettings={this.setSettings}
          settings={this.state.settings}
        />
        <Preview
          combinations={this.state.combinations}
          numberOfImages={this.state.numberOfImages}
          settings={this.state.settings}
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
        <form id="SlidersForm">
          Padding: <input type="range"  min={1} max={8} step={0.1} value={this.props.settings.padding} onChange={this.props.setSettings.bind(this, "padding")}/>
          Gap: <input type="range"  min={0} max={10} step={0.1} value={this.props.settings.gap} onChange={this.props.setSettings.bind(this, "gap")}/>
          (beta) Tryb doodle: <input type="checkbox" value={this.props.settings.doodle} onChange={this.props.setSettings.bind(this, "doodle")}/>
        </form>
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
                gridTemplateRows: "repeat("+Math.ceil(Math.sqrt(this.props.numberOfImages))+", auto)",
                gridGap: this.props.settings.gap + "em",
                padding: this.props.settings.padding + "em"
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
