import express from 'express';
import { ruruHTML } from 'ruru/server';
import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

enum menuTypes {
    APPETIZER = 'APPETIZER',
    COLD_SANDWICH = 'COLD SANDWICH',
    ENCHILADAS = 'ENCHILADAS',
    ENTREES = 'ENTREES',
    FAJITAS = 'FAJITAS',
    GREEN_SALADS = 'GREEN SALADS',
    HOT_SANDWICH = 'HOT SANDWICH',
    QUICHE = 'QUICHE',
    SOUP_SALAD_COMBOS = 'SOUP & SALAD COMBOS',
    TACOS = 'TACOS',
}

const validMenuTypes = new GraphQLEnumType({
    name: 'types',
    values: {
        'APPETIZER': { value: menuTypes.APPETIZER },
        'COLD_SANDWICH': { value: menuTypes.COLD_SANDWICH },
        'ENCHILADAS': { value: menuTypes.ENCHILADAS },
        'ENTREES': { value: menuTypes.ENTREES },
        'FAJITAS': { value: menuTypes.FAJITAS },
        'GREEN_SALADS': { value: menuTypes.GREEN_SALADS },
        'HOT_SANDWICH': { value: menuTypes.HOT_SANDWICH},
        'QUICHE': { value: menuTypes.QUICHE },
        'SOUP_SALAD_COMBOS': { value: menuTypes.SOUP_SALAD_COMBOS },
        'TACOS': { value: menuTypes.TACOS },
    }
});

const upgrade = new GraphQLObjectType({
    name: 'Upgrade',
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        price: { type: GraphQLFloat },
    },
});

const option = new GraphQLObjectType({
    name: 'Option',
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
    },
});

const options = new GraphQLObjectType({
    name: 'Options',
    fields: {
        id: { type: GraphQLInt },
        list: { type: new GraphQLList(option) },
        upgrades: { type: new GraphQLList(upgrade) }
    },
});

const item = new GraphQLObjectType({
    name: 'Item',
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        price: { type: GraphQLFloat },
        options: { type: new GraphQLList(options) },
        type: { type: validMenuTypes }
    },
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            menu: { 
                type: new GraphQLList(item),
                args: {
                    type: { type: validMenuTypes }
                },
            },
        },
    }),
});

type MenuResolverParams = { type: menuTypes };

const rootValue = {
    async menu({ type }: MenuResolverParams) {
        const results = await db.item.findMany({ 
            where: { type },
            include: { 
                options: { 
                    include: { 
                        list: {
                            include: {
                                list: true,
                                upgrades: true
                            }
                        }
                    }
                }
            }
        });

        // Unwind relational table to keep only the underlying options table data
        const items = results.map((item) => {
            const unwound = item.options.map(o => ({ 
                list: o.list.list, 
                upgrades: o.list.upgrades
            }));
            return  { ...item, options: unwound };
        })

        return items;
    },
};

const app = express();
const port = 3131;

// Serve the GraphiQL IDE.
app.get('/', (_req, res) => {
    res.type('html');
    res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.all('/graphql', createHandler({ schema, rootValue }));

app.listen(port, () => {
  console.log(`Running a server at http://localhost:${port}`);
});
