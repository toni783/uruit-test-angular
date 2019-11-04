export class PlayerModel {
  nickname: string;
  id: number;
  score: number;

  constructor(nickname?: string, id?: number, score?: number) {
    this.nickname = nickname;
    this.id = id;
    this.score = score;
  }
}
