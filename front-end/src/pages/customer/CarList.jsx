import React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid'
import myfetch from '../../lib/myfetch'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import { Link } from 'react-router-dom'
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import useConfirmDialog from '../../ui/useConfirmDialog';
import useNotification from '../../ui/useNotification';
import useWaiting from '../../ui/useWaiting';

export default function Carlist() {

  function sellingDate(sellingDate) {
    if (sellingDate) {
        const date = new Date(sellingDate);
        const formattedDate = date.toLocaleDateString('pt-BR'); 
        return formattedDate;
    }
    return '';
  }

    const columns = [

        {
            field: 'id',
            headerName: 'Cód.',
            type: 'number',
            width: 80
        },
        {
            field: 'brand',
            headerName: 'Marca/modelo',
            width: 250,
            valueGetter: (value, row) => row.brand + '/' + row.model
        },
        {
            field: 'color',
            headerName: 'cor',
            width: 250
        },
        {
            field: 'year_manufacture',
            headerName: 'ano_fabricação',
            width: 160
        },
        {
            field: 'imported',
            headerName: 'importado',
            width: 160,
            valueGetter: (value, row) => row.imported ? "Sim" : ""
        },
        {
            field: 'plates',
            headerName: 'placa',
            width: 160
        },
        {
          field: 'selling_date',
          headerName: 'Data de venda',
          width: 150,
          valueGetter: (value, row) => sellingDate(row.selling_date)
        },
        {
            field: 'selling_price',
            headerName: 'preco_venda',
            type: 'number',
            width: 160
        },
        {
            field: '_edit',
            headerName: 'Editar',
            headerAlign: 'center',
            align: 'center',
            sortable: 'false',
            width: 90,
            renderCell: params => (
                <Link to={`./${params.id}`}>
                    <IconButton aria-label="Editar">
                        <EditIcon />
                    </IconButton>
                </Link>
            )
        },
        {
            field: '_delete',
            headerName: 'Excluir',
            headerAlign: 'center',
            align: 'center',
            sortable: 'false',
            width: 90,
            renderCell: params => (
                <IconButton aria-label="Excluir" onClick={() => handleDeleteButtonClick(params.id)}>
                    <DeleteForeverIcon color="error" />
                </IconButton>
            )
        }
    ]

    const [state, setState] = React.useState({
        cars: []
      })
      const {
        cars
      } = state
    
      const { askForConfirmation, ConfirmDialog } = useConfirmDialog()
      const { notify, Notification } = useNotification()
      const { showWaiting, Waiting } = useWaiting()
    
      /*
        useEffect() com vetor de dependências vazio irá ser executado
        apenas uma vez, durante o carregamento inicial do componente
      */
      React.useEffect(() => {
        fetchData()
      }, [])
    
      async function fetchData() {
        showWaiting(true)
        try {
          const result = await myfetch.get('/cars')
          setState({
            ...state,
            cars: result
          })
        }
        catch(error) {
          console.error(error)
          notify(error.message, 'error')
        }
        finally {
          showWaiting(false)
        }
      }
    
      async function handleDeleteButtonClick(deleteId) {
        if(await askForConfirmation('Deseja realmente excluir este item?')) {
          
          showWaiting(true)
          try {
            await myfetch.delete(`/cars/${deleteId}`)
    
            // Recarrega os dados da grid
            fetchData()
    
            notify('Item excluído com sucesso.')
          }
          catch(error) {
            console.log(error)
            notify(error.message, 'error')
          }
          finally {
            showWaiting(false)
          }
        }
      }
    
      return(
        <>
          <Waiting />
          <Notification />
          <ConfirmDialog />
    
          <Typography variant="h1" gutterBottom>
            Listagem de Carros
          </Typography>
    
          <Box sx={{
            display: 'flex',
            justifyContent: 'right',
            mb: 2   
          }}>
            <Link to="./new">
              <Button
                variant="contained"
                size="large"
                color="secondary"
                startIcon={<AddBoxIcon />}
              >
                Novo carro
              </Button>
            </Link>
          </Box>
    
          <Paper elevation={10}>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={cars}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
              />
            </Box>
          </Paper>
        </>
      )
}