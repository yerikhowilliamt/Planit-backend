import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as dotenv from 'dotenv';
import { AuthService } from '../auth.service';

dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) {
    const { displayName, emails, photos, provider, id } = profile;

    const user = await this.authService.validate({
      name: displayName,
      email: emails[0].value,
      emailVerified: emails[0].verified,
      image: photos[0].value,
      accessToken,
      refreshToken,
      provider,
      providerAccountId: id,
    });

    done(null, user);
  }
}