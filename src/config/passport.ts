import passport from 'koa-passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { getEnv } from './dotenv';

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        const user = await User.findOne({ where: { id: payload.id } });
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
);
