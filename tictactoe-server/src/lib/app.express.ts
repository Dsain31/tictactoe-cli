import express from "express";
export class AppExpress {
  private readonly _express: express.Express;
  constructor(app: express.Express) {
    this._express = app;
  }

  get express() {
    return this._express;
  }
}

