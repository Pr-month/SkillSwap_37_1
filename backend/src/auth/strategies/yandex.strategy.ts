import { Profile, Strategy } from 'passport-yandex';
import { YandexConfig, yandexConfig } from 'src/config/yandex-oauth.config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';


@Injectable()
export class YandexStrategy extends PassportStrategy(
  Strategy,
  'yandex',
) {
  constructor(
    @Inject(yandexConfig.KEY)
    private readonly config: YandexConfig,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string,
                 profile: Profile
  ) {

    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Email не предоставлен Яндексом');
    }

    const userData = {
      email,
      name: profile.displayName ?? '',
      avatar: profile.photos?.[0]?.value,
      password: '',
    };

    return await this.authService.validateYandexUser(userData);
  }
}
