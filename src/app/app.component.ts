import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  warriorForm: FormGroup; 
  inputObjects = [];
  teamAutobots = [];
  teamDeceptions = [];
  numBattles = 0;
  winnersList = [];
  losersList = [];
  abortFlag = false;
  scoreAutobots = 0;
  scoreDeceptions = 0;
  winningTeam = "";
  finalWinners = [];
  losingTeam = "";
  finalLosers = [];
  survivors = [];

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.warriorForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      strength: ['', [Validators.required]],
      intelligence: ['', [Validators.required]],
      speed: ['', [Validators.required]],
      endurance: ['', [Validators.required]],
      rank: ['', [Validators.required]],
      courage: ['', [Validators.required]],
      firepower: ['', [Validators.required]],
      skill: ['', [Validators.required]],
    });
  }
  onWarriorAdd() {
    let inputObj = {
      name: this.warriorForm.get('name').value,
      type: this.warriorForm.get('type').value,
      strength: +this.warriorForm.get('strength').value,
      intelligence: +this.warriorForm.get('intelligence').value,
      speed: +this.warriorForm.get('speed').value,
      endurance: +this.warriorForm.get('endurance').value,
      rank: +this.warriorForm.get('rank').value,
      courage: +this.warriorForm.get('courage').value,
      firepower: +this.warriorForm.get('firepower').value,
      skill: +this.warriorForm.get('skill').value,
      str: `${this.warriorForm.get('name').value},${this.warriorForm.get('type').value},${this.warriorForm.get('strength').value},${this.warriorForm.get('intelligence').value},${this.warriorForm.get('speed').value},${this.warriorForm.get('endurance').value},${this.warriorForm.get('rank').value},${this.warriorForm.get('courage').value},${this.warriorForm.get('firepower').value},${this.warriorForm.get('skill').value}`,
      overallRating: +this.warriorForm.get('strength').value + +this.warriorForm.get('intelligence').value + +this.warriorForm.get('speed').value + +this.warriorForm.get('endurance').value + +this.warriorForm.get('firepower').value
    }
    this.inputObjects.push(inputObj);
    if(inputObj.type === "A") {
      this.teamAutobots.push(inputObj);
    }
    else {
      this.teamDeceptions.push(inputObj);
    }
    this.warriorForm.reset();
  }

  runGame() {
    //sort the warriors in descending order 
    //rank 10: highest, rank 1: lowest
    this.teamAutobots.sort((a,b) => b.rank - a.rank);
    this.teamDeceptions.sort((a,b) => b.rank - a.rank);
    this.numBattles = Math.min(this.teamAutobots.length, this.teamDeceptions.length);

    for(let i=0; i<this.numBattles; i++) {

      //special rules
      if( (this.teamAutobots[i].name.trim().toLowerCase() === "optimus prime") && (this.teamDeceptions[i].name.trim().toLowerCase() === "predaking") ) {
        this.abortFlag = true;
        break;
      }
      if( this.teamAutobots[i].name.trim().toLowerCase() === "optimus prime") {
        this.updateLists('A', i);
        continue;
      }
      if( this.teamDeceptions[i].name.trim().toLowerCase() === "predaking") {
        this.updateLists('D', i);
        continue;
      }

      //run-away
      if( ((this.teamAutobots[i].courage - this.teamDeceptions[i].courage) >= 4) && ((this.teamAutobots[i].strength - this.teamDeceptions[i].strength) >= 3)) {
        this.updateLists('A', i);
        continue;
      }
      if( ((this.teamDeceptions[i].courage - this.teamAutobots[i].courage) >= 4) && ((this.teamDeceptions[i].strength - this.teamAutobots[i].strength) >= 3)) {
        this.updateLists('D', i);
        continue;
      }

      //skill based
      if( (this.teamAutobots[i].skill - this.teamDeceptions[i].skill) >= 3) {
        this.updateLists('A', i);
        continue;
      }
      if( (this.teamDeceptions[i].skill - this.teamAutobots[i].skill) >= 3) {
        this.updateLists('D', i);
        continue;
      }

      //overall rating based
      if( this.teamAutobots[i].overallRating > this.teamDeceptions[i].overallRating) {
        this.updateLists('A', i);
        continue;
      }
      if( this.teamDeceptions[i].overallRating > this.teamAutobots[i].overallRating) {
        this.updateLists('D', i);
        continue;
      }
      //tie - nothing is pushed to winnersList/losersList
    }

    if( !this.abortFlag) {
      this.scoreAutobots = this.winnersList.reduce((prev, next) => {
        if( next.team === "A") {
          prev++;
        }
        return prev;
      }, 0);
      this.scoreDeceptions = this.winnersList.reduce((prev, next) => {
        if( next.team === "D") {
          prev++;
        }
        return prev;
      }, 0);
      if(this.scoreAutobots > this.scoreDeceptions) {
        this.winningTeam = "Autobots";
        this.losingTeam = "Deceptions";
        this.finalWinners = this.winnersList.filter(el => el.team === "A").map(el => el.name);
        this.finalLosers = this.losersList.filter(el => el.team === "D").map(el => el.name);
        this.survivors = this.teamDeceptions.filter(el => !this.finalLosers.includes(el.name));
      }
      if(this.scoreAutobots < this.scoreDeceptions) {
        this.winningTeam = "Deceptions";
        this.losingTeam = "Autobots";
        this.finalWinners = this.winnersList.filter(el => el.team === "D").map(el => el.name);
        this.finalLosers = this.losersList.filter(el => el.team === "A").map(el => el.name);
        this.survivors = this.teamAutobots.filter(el => !this.finalLosers.includes(el.name));
      }

    }
  }

  updateLists(winner, i) {
    this.winnersList.push({
      team: winner,
      name: winner === "A" ? this.teamAutobots[i].name:this.teamDeceptions[i].name
    });
    this.losersList.push({
      team: winner === "A" ? "D": "A",
      name: winner === "A" ? this.teamDeceptions[i].name:this.teamAutobots[i].name 
    });
  }
}
