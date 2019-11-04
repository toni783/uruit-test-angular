import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayerModel } from 'src/models/player.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  url = 'https://localhost:5001/api/';

  title = 'UruItTestAngular';

  playerModes = { playerAMode: '', playerBMode: '' }; // newPlayer and loadPlayer

  playerAMove;

  playerBMove;

  selectedPlayerA = new PlayerModel();

  selectedPlayerB = new PlayerModel();

  playerList$;

  gameStarted = false;

  disableMovesPLayerA = false;
  disableMovesPLayerB = false;

  winnerList = [];
  winnerACount = 0;
  winnerBCount = 0;

  winnerAllTimeList$;

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.initPlayersList();
    this.initScoreBoardList();
  }

  initPlayersList() {
    this.playerList$ = this.httpClient.get(`${this.url}players`);
  }

  initScoreBoardList() {
    this.winnerAllTimeList$ = this.httpClient.get(`${this.url}players/GetScoreBoard`);
  }

  onPlayerMode(property, value) {
    switch (property) {
      case 'playerAMode':
        this.selectedPlayerA = new PlayerModel();

        break;

      case 'playerBMode':
        this.selectedPlayerB = new PlayerModel();

        break;

      default:
        break;
    }

    this.playerModes[property] = value;
  }

  onStartGame() {
    if (this.isStartGameDisabled) {
      return;
    }
    this.gameStarted = true;

    if (!this.selectedPlayerA.id || !this.selectedPlayerB.id) {
      let params = new HttpParams();

      params = params.set('playerANickname', this.selectedPlayerA.nickname);
      params = params.set('playerBNickname', this.selectedPlayerB.nickname);

      this.httpClient
        .get(`${this.url}players/StartGame`, { params })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res: any) => {
          this.selectedPlayerA = this.selectedPlayerA.id ? this.selectedPlayerA : res.playerA[0];
          this.selectedPlayerB = this.selectedPlayerB.id ? this.selectedPlayerB : res.playerB[0];
        });
    }
  }

  onSelecMove(type, move) {
    if (type === 'playerA' && !this.disableMovesPLayerA) {
      this.playerAMove = move;
    } else {
      if (type === 'playerB' && !this.disableMovesPLayerB) {
        this.playerBMove = move;
      }
    }
  }

  onPlayerConfirmSelection(type) {
    if (type === 'playerA' && this.playerAMove) {
      this.disableMovesPLayerA = true;
    } else {
      if (type === 'playerB' && this.playerBMove) {
        this.disableMovesPLayerB = true;
      }
    }

    if (this.playerAMove && this.disableMovesPLayerA && this.playerBMove && this.disableMovesPLayerB) {
      switch (true) {
        case this.playerAMove === 'rock' && this.playerBMove === 'scissor':
          this.selectedPlayerA.score++;
          this.updatePlayerScore(this.selectedPlayerA);
          this.winnerList.push({ winner: this.selectedPlayerA, selectionA: 'rock', selectionB: 'scissor' });
          this.winnerACount++;
          break;

        case this.playerAMove === 'scissor' && this.playerBMove === 'paper':
          this.selectedPlayerA.score++;
          this.updatePlayerScore(this.selectedPlayerA);
          this.winnerList.push({ winner: this.selectedPlayerA, selectionA: 'scissor', selectionB: 'paper' });
          this.winnerACount++;
          break;

        case this.playerAMove === 'paper' && this.playerBMove === 'rock':
          this.selectedPlayerA.score++;
          this.updatePlayerScore(this.selectedPlayerA);
          this.winnerList.push({ winner: this.selectedPlayerA, selectionA: 'paper', selectionB: 'rock' });
          this.winnerACount++;
          break;

        case this.playerBMove === 'rock' && this.playerAMove === 'scissor':
          this.selectedPlayerB.score++;
          this.updatePlayerScore(this.selectedPlayerB);
          this.winnerList.push({ winner: this.selectedPlayerB, selectionB: 'rock', selectionA: 'scissor' });
          this.winnerBCount++;
          break;

        case this.playerBMove === 'scissor' && this.playerAMove === 'paper':
          this.selectedPlayerB.score++;
          this.updatePlayerScore(this.selectedPlayerB);
          this.winnerList.push({ winner: this.selectedPlayerB, selectionB: 'scissor', selectionA: 'paper' });
          this.winnerBCount++;

          break;

        case this.playerBMove === 'paper' && this.playerAMove === 'rock':
          this.selectedPlayerB.score++;
          this.updatePlayerScore(this.selectedPlayerB);
          this.winnerList.push({ winner: this.selectedPlayerB, selectionB: 'paper', selectionA: 'rock' });
          this.winnerBCount++;

          break;

        case this.playerAMove === this.playerBMove:
          this.winnerList.push(new PlayerModel('No Winner'));
          break;

        default:
          break;
      }

      if (this.isGameFinished) {
        this.playerAMove = null;
        this.playerBMove = null;
        this.disableMovesPLayerA = false;

        this.disableMovesPLayerB = false;
      }
    }
  }

  get isStartGameDisabled() {
    return !this.selectedPlayerA.nickname || !this.selectedPlayerB.nickname;
  }

  get isGameFinished() {
    return !(this.winnerACount === 3) && !(this.winnerBCount === 3);
  }

  updatePlayerScore(player: PlayerModel) {
    this.httpClient
      .put(`${this.url}Players/${player.id}`, player)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any) => {});
  }

  restartGame() {
    this.gameStarted = false;
    this.winnerACount = 0;
    this.winnerBCount = 0;
    this.selectedPlayerA = new PlayerModel();
    this.selectedPlayerB = new PlayerModel();
    this.playerModes = { playerAMode: '', playerBMode: '' }; // newPlayer and loadPlayer
    this.playerAMove = null;
    this.playerBMove = null;
    this.winnerList = [];
    this.disableMovesPLayerA = false;
    this.disableMovesPLayerB = false;

    this.initScoreBoardList();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
